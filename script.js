const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
let allIssues = [];

// Handle Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        fetchIssues();
    } else {
        alert("Invalid Credentials!");
    }
});

// Fetch All
async function fetchIssues() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allIssues = data.data || data; //
        displayIssues(allIssues);
    } catch (err) { console.error(err); }
}

// Display Cards & Update Count
function displayIssues(issues) {
    const container = document.getElementById('issues-container');
    const countDisplay = document.getElementById('issue-count');
    container.innerHTML = "";
    countDisplay.innerText = issues.length;

    issues.forEach(issue => {
        const isClosed = issue.status.toLowerCase() === 'closed';
        const borderClass = isClosed ? 'border-t-purple-500' : 'border-t-emerald-500';
        const iconColor = isClosed ? 'text-purple-500' : 'text-emerald-500';

        const card = document.createElement('div');
        card.className = `bg-white p-6 rounded-2xl border border-slate-100 border-t-4 ${borderClass} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col`;
        card.onclick = () => showModal(issue.id);

        card.innerHTML = `
            <div class="flex justify-between items-center mb-5">
                <i class="fa-solid fa-circle-notch ${iconColor} text-lg"></i>
                <span class="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">${issue.priority}</span>
            </div>
            <h3 class="font-bold text-slate-800 text-lg mb-2 leading-tight">${issue.title}</h3>
            <p class="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">${issue.description}</p>
            <div class="flex gap-2 mb-8">
                <span class="bg-red-50 text-red-400 border border-red-100 px-3 py-1 rounded-full text-[10px] font-bold">🐞 BUG</span>
                <span class="bg-orange-50 text-orange-400 border border-orange-100 px-3 py-1 rounded-full text-[10px] font-bold">⚙️ HELP WANTED</span>
            </div>
            <div class="mt-auto pt-5 border-t border-slate-50 text-[12px] text-slate-400 font-bold">
                <p>#${issue.id} by ${issue.author}</p>
                <p class="font-medium text-slate-300">${issue.createdAt}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Strict Title-Only Search
document.getElementById('search-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim().toLowerCase();
        if (!query) { displayIssues(allIssues); return; }
        
        try {
            const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`);
            const data = await res.json();
            const results = (data.data || data).filter(issue => issue.title.toLowerCase().includes(query));
            displayIssues(results);
        } catch (err) { console.error(err); }
    }
});

// Modal Logic
async function showModal(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const data = await res.json();
    const issue = data.data || data;
    const modalBox = document.getElementById('modal-content');
    modalBox.innerHTML = `
        <div class="p-10 text-left">
            <h2 class="text-3xl font-black text-slate-800 mb-3">${issue.title}</h2>
            <div class="flex items-center gap-3 mb-8">
                <span class="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Opened</span>
                <span class="text-slate-400 text-sm font-medium">• Opened by ${issue.author} • ${issue.createdAt}</span>
            </div>
            <p class="text-slate-600 leading-relaxed text-lg mb-12 pb-12 border-b border-dashed border-slate-200">${issue.description}</p>
            <div class="bg-slate-50 p-8 rounded-3xl flex justify-between items-center">
                <div><p class="text-[11px] font-black text-slate-400 uppercase mb-2">Assignee</p><p class="text-xl font-black text-slate-700">${issue.author}</p></div>
                <div class="text-right"><p class="text-[11px] font-black text-slate-400 uppercase mb-2">Priority</p><span class="bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg shadow-red-200">${issue.priority}</span></div>
            </div>
            <div class="flex justify-end mt-10"><label for="issue-modal" class="btn btn-primary bg-[#4F46E5] border-none px-12 rounded-2xl text-white font-bold h-14 cursor-pointer">Close</label></div>
        </div>
    `;
    document.getElementById('issue-modal').checked = true;
}

// Tab Filter
function filterIssues(status) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-[#4F46E5]', 'text-white');
        btn.classList.add('text-slate-500', 'hover:bg-white');
    });
    const activeBtn = document.getElementById(`tab-${status}`);
    activeBtn.classList.add('bg-[#4F46E5]', 'text-white');
    activeBtn.classList.remove('text-slate-500', 'hover:bg-white');
    const filtered = status === 'all' ? allIssues : allIssues.filter(i => i.status.toLowerCase() === status);
    displayIssues(filtered);
}