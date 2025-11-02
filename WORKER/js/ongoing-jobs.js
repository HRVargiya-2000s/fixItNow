// Worker-side ongoing jobs manager
// Shows issues assigned to the logged-in worker and enables submitting completion photos

async function waitForAuthGuard() {
	if (window.workerAuthGuard && typeof window.workerAuthGuard.init === 'function') {
		try { await window.workerAuthGuard.init() } catch (e) { console.warn('workerAuthGuard.init() error (ignored):', e) }
	}

	if (window.unifiedAuth && typeof window.unifiedAuth.waitForInit === 'function') {
		try { await window.unifiedAuth.waitForInit() } catch (e) {}
	}
}

async function waitForWorkerAuth() {
	if (window.workerAuth && typeof window.workerAuth.init === 'function') {
		try { await window.workerAuth.init() } catch (e) { console.warn('workerAuth.init() error:', e) }
	}
}

function formatDate(ts) {
	try {
		if (!ts) return ''
		const d = ts.toDate ? ts.toDate() : new Date(ts)
		return d.toLocaleString()
	} catch (e) { return '' }
}

function createOngoingCard(issueId, data) {
	// FILTER LAYER 3: Skip rendering completed or submitted jobs
	const status = (data.status || 'pending').toLowerCase().trim()
	if (status === 'completed' || status === 'submitted') {
		console.log(`[ongoing-jobs] Skipping card render for job ${issueId} - status: ${status}`)
		return ''
	}

	const imagesHtml = (data.images || []).slice(0,3).map(url => `<img src="${url}" style="width:100px;height:70px;object-fit:cover;border-radius:6px;margin-right:6px">`).join('')
	const desc = (data.description || '').slice(0,220)

	// Determine action button based on status
	let actionHtml = ''
	if (!data.status || data.status === 'accepted' || data.status === 'in-progress') {
		actionHtml = `<button class="btn-primary btn-submit-work" data-id="${issueId}">Submit Work</button>`
	} else if (data.status === 'submitted') {
		actionHtml = `<button class="btn-secondary" disabled>Submitted</button>`
	} else if (data.status === 'completed') {
		actionHtml = `<button class="btn-secondary" disabled>Completed</button>`
	}

	return `
		<div class="job-card" data-id="${issueId}" style="border-radius:10px;padding:16px;background:var(--bg-card);box-shadow:0 6px 18px rgba(0,0,0,0.08);margin-bottom:12px;">
			<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
				<div style="flex:1">
					<h3 style="margin:0 0 6px 0">${data.title || 'Untitled'}</h3>
					<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">
						<strong>Category:</strong> ${data.category || '-'} • <strong>Urgency:</strong> ${data.urgency || '-'} • <strong>Budget:</strong> ${data.budget ? ('$' + (data.budget.min || data.budget.max || 'N/A')) : 'Not specified'}
					</div>
					<p style="margin:0 0 8px 0;color:var(--text-light);">${desc}${(data.description && data.description.length>220)?'...':''}</p>

					<div style="display:flex;align-items:center;gap:10px;margin-top:8px">${imagesHtml}</div>

					<div style="margin-top:10px;font-size:13px;color:var(--text-secondary)">
						<div><i class="fas fa-map-marker-alt"></i> ${data.location ? (data.location.address + ', ' + (data.location.city||'') ) : 'Location not provided'}</div>
						<div><i class="fas fa-clock"></i> ${formatDate(data.createdAt)}</div>
					</div>
				</div>

				<div style="width:200px;display:flex;flex-direction:column;gap:8px;align-items:flex-end">
					<div style="font-size:12px;color:var(--text-secondary)">Status: <strong>${data.status || 'pending'}</strong></div>
					<button class="btn-secondary btn-view-issue" data-id="${issueId}">View</button>
					${actionHtml}
				</div>
			</div>
		</div>
	`
}

async function loadOngoingJobs() {
	await waitForAuthGuard()
	await waitForWorkerAuth()

	let workerUid = null
	try {
		if (window.workerAuthGuard && window.workerAuthGuard.getUser) {
			const u = window.workerAuthGuard.getUser()
			workerUid = (u && (u.uid || u.id || u._id || u.userId)) || workerUid
		}
	} catch (e) { console.warn('workerAuthGuard.getUser() error:', e) }

	if (!workerUid) {
		try {
			if (window.workerAuth && window.workerAuth.getUser) {
				const u = window.workerAuth.getUser()
				workerUid = (u && (u.uid || u.id)) || workerUid
			}
		} catch (e) { console.warn('workerAuth.getUser() error:', e) }
	}

	if (!workerUid) {
		try {
			if (window.unifiedAuth && window.unifiedAuth.getUser) {
				const u = window.unifiedAuth.getUser()
				workerUid = (u && u.uid) || workerUid
			}
		} catch (e) { console.warn('unifiedAuth.getUser() error:', e) }
	}

	if (!workerUid) {
		try {
			const stored = localStorage.getItem('fixitnow_user')
			if (stored) {
				const parsed = JSON.parse(stored)
				workerUid = parsed.uid || workerUid
			}
		} catch (e) {}
	}

	if (!workerUid) {
		console.warn('No worker UID available; cannot load ongoing jobs')
		const grid = document.getElementById('ongoingJobsGrid')
		if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Please login to view your ongoing jobs.</div>'
		return
	}

		try {
		const q = db.collection('issues').where('assignedWorker', '==', workerUid)

		q.onSnapshot(async (snapshot) => {
			const grid = document.getElementById('ongoingJobsGrid')
			if (!grid) return

			if (snapshot.empty) {
				grid.innerHTML = `<div style="grid-column:1/-1;padding:2.5rem;text-align:center;color:var(--text-secondary)"><i class="fas fa-briefcase" style="font-size:2.6rem;margin-bottom:10px"></i><div>No active assignments</div></div>`
				const rc = document.getElementById('resultsCount')
				if (rc) rc.textContent = '0'
				return
			}

			const docs = []
			snapshot.forEach(doc => docs.push({ id: doc.id, data: doc.data() }))

			// FILTER LAYER 1: Remove completed/submitted jobs from the collection
			const activeJobs = docs.filter(d => {
				const status = (d.data.status || 'pending').toLowerCase().trim()
				const isActive = status !== 'completed' && status !== 'submitted'
				if (!isActive) {
					console.log(`[ongoing-jobs] Filtering out job ${d.id} - status: ${status}`)
				}
				return isActive
			})

			// Sort by acceptedAt (newest first) or createdAt as fallback
			activeJobs.sort((a, b) => {
				const ta = a.data.acceptedAt && a.data.acceptedAt.toDate ? a.data.acceptedAt.toDate().getTime() : (a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0)
				const tb = b.data.acceptedAt && b.data.acceptedAt.toDate ? b.data.acceptedAt.toDate().getTime() : (b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0)
				return tb - ta
			})

			const items = activeJobs.map(d => createOngoingCard(d.id, d.data)).filter(html => html !== '')
			grid.innerHTML = items.join('\n')

			const rc = document.getElementById('resultsCount')
			if (rc) rc.textContent = String(activeJobs.filter(d => {
				const html = createOngoingCard(d.id, d.data)
				return html !== ''
			}).length)

			// Wire up buttons
			document.querySelectorAll('.btn-view-issue').forEach(btn => {
				btn.onclick = () => {
					const id = btn.getAttribute('data-id')
					window.location.href = `../pages/issue-detail.html?id=${id}`
				}
			})

			document.querySelectorAll('.btn-submit-work').forEach(btn => {
				btn.onclick = async () => {
					const id = btn.getAttribute('data-id')
					// find doc data
					const doc = activeJobs.find(d => d.id === id)
					if (!doc) return alert('Issue not found')

					// Ask user to select images
					const input = document.createElement('input')
					input.type = 'file'
					input.accept = 'image/*'
					input.multiple = true
					input.click()

					input.onchange = async (e) => {
						const files = Array.from(e.target.files || [])
						if (files.length === 0) return
						if (!confirm(`Upload ${files.length} image(s) and submit work for review?`)) return

						try {
							btn.disabled = true
							btn.textContent = 'Uploading...'

							// Upload all files to Cloudinary
							console.log(`[ongoing-jobs] Uploading ${files.length} file(s)...`)
							const uploadPromises = files.map(f => CloudinaryUpload.uploadToCloudinary(f))
							const results = await Promise.all(uploadPromises)
							const urls = results.map(r => r.secure_url)
							
							console.log(`[ongoing-jobs] Upload complete. Got ${urls.length} URLs:`, urls)

							// Update Firestore: append completionPhotos (overwrite for simplicity), set status to 'submitted'
							console.log(`[ongoing-jobs] Updating issue ${id} in Firestore with:`, {
								status: 'submitted',
								completionPhotos: urls,
								submittedAt: 'serverTimestamp',
								submittedByWorker: workerUid
							})
							
							await db.collection('issues').doc(id).update({
								status: 'submitted',
								completionPhotos: urls,
								submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
								submittedByWorker: workerUid
							})
							
							console.log(`[ongoing-jobs] Issue ${id} updated successfully!`)

							// Notify the user
							try {
								if (doc.data && doc.data.userId) {
									await db.collection('users').doc(doc.data.userId).collection('notifications').add({
										message: `Worker submitted work for your issue: ${doc.data.title || 'Untitled'}`,
										issueId: id,
										createdAt: firebase.firestore.FieldValue.serverTimestamp(),
										type: 'submission'
									})
								}
							} catch (e) { console.warn('Failed to create user notification:', e) }

							alert('Work submitted successfully. Waiting for user review.')
						} catch (err) {
							console.error('Error submitting work:', err)
							alert('Failed to submit work. See console for details.')
						} finally {
							btn.disabled = false
							btn.textContent = 'Submit Work'
						}
					}
				}
			})
			}, (err) => {
				console.error('ongoing-jobs snapshot error:', err)
				const grid = document.getElementById('ongoingJobsGrid')
				if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Unable to load ongoing jobs (Realtime). Please refresh the page.</div>'
			})
	} catch (err) {
		console.error('Error loading ongoing jobs:', err)
		const grid = document.getElementById('ongoingJobsGrid')
		if (grid) grid.innerHTML = '<div style="padding:2rem;color:var(--text-secondary)">Unable to load ongoing jobs.</div>'
	}
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
	if (typeof db === 'undefined') {
		console.error('Firestore `db` not found. Ensure config.js is loaded before this script.')
		return
	}

	loadOngoingJobs()
})

