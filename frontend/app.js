document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const noteForm = document.getElementById('note-form');
    const notesSection = document.getElementById('notes-section');
    const authSection = document.getElementById('auth-section');
    const notesList = document.getElementById('notes-list');
    const trashedNotesList = document.getElementById('trashed-notes-list');

    let token = null;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.token) {
            token = data.token;
            authSection.style.display = 'none';
            notesSection.style.display = 'block';
            loadNotes();
        } else {
            alert('Login failed');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.message) {
            alert('Registration successful, please log in');
        } else {
            alert('Registration failed');
        }
    });

    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim());
        const color = document.getElementById('note-color').value;

        const res = await fetch('http://localhost:3000/api/notes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            body: JSON.stringify({ title, content, tags, color })
        });
        const data = await res.json();
        if (data.message) {
            loadNotes();
        } else {
            alert('Failed to add note');
        }
    });

    async function loadNotes() {
        const res = await fetch('http://localhost:3000/api/notes', {
            headers: { 'x-access-token': token }
        });
        const notes = await res.json();
        notesList.innerHTML = '';
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="tags">${note.tags.join(', ')}</div>
                <div class="note-actions">
                    <button onclick="updateNoteForm(${note.id})">Edit</button>
                    <button onclick="deleteNote(${note.id})">Trash</button>
                </div>
            `;
            notesList.appendChild(noteElement);
        });

        // Load trashed notes
        const trashedRes = await fetch('http://localhost:3000/api/notes/trashed', {
            headers: { 'x-access-token': token }
        });
        const trashedNotes = await trashedRes.json();
        trashedNotesList.innerHTML = '';
        trashedNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="tags">${note.tags.join(', ')}</div>
                <div class="note-actions">
                    <button onclick="restoreNote(${note.id})">Restore</button>
                    <button onclick="permanentlyDeleteNote(${note.id})">Delete</button>
                </div>
            `;
            trashedNotesList.appendChild(noteElement);
        });
    }

    window.updateNoteForm = (id) => {
        const note = notes.find(note => note.id === id);
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        document.getElementById('note-tags').value = note.tags.join(', ');
        document.getElementById('note-color').value = note.color;
        noteForm.dataset.noteId = note.id;
    };

    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const noteId = noteForm.dataset.noteId;
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim());
        const color = document.getElementById('note-color').value;

        if (noteId) {
            // Update note
            const res = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({ title, content, tags, color })
            });
            const data = await res.json();
            if (data.message) {
                loadNotes();
                noteForm.dataset.noteId = '';
            } else {
                alert('Failed to update note');
            }
        } else {
            // Create new note
            const res = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({ title, content, tags, color })
            });
            const data = await res.json();
            if (data.message) {
                loadNotes();
            } else {
                alert('Failed to add note');
            }
        }
    });

    window.deleteNote = async (id) => {
        const res = await fetch(`http://localhost:3000/api/notes/${id}`, {
            method: 'DELETE',
            headers: { 'x-access-token': token }
        });
        const data = await res.json();
        if (data.message) {
            loadNotes();
        } else {
            alert('Failed to delete note');
        }
    };

    window.restoreNote = async (id) => {
        const res = await fetch(`http://localhost:3000/api/notes/${id}/restore`, {
            method: 'PUT',
            headers: { 'x-access-token': token }
        });
        const data = await res.json();
        if (data.message) {
            loadNotes();
        } else {
            alert('Failed to restore note');
        }
    };

    window.permanentlyDeleteNote = async (id) => {
        const res = await fetch(`http://localhost:3000/api/notes/${id}/permanent`, {
            method: 'DELETE',
            headers: { 'x-access-token': token }
        });
        const data = await res.json();
        if (data.message) {
            loadNotes();
        } else {
            alert('Failed to permanently delete note');
        }
    };

    // Function to load notes by tag
    window.loadNotesByTag = async (tag) => {
        const res = await fetch(`http://localhost:3000/api/notes/tag/${tag}`, {
            headers: { 'x-access-token': token }
        });
        const notes = await res.json();
        notesList.innerHTML = '';
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="tags">${note.tags.join(', ')}</div>
                <div class="note-actions">
                    <button onclick="updateNoteForm(${note.id})">Edit</button>
                    <button onclick="deleteNote(${note.id})">Trash</button>
                </div>
            `;
            notesList.appendChild(noteElement);
        });
    };
});
