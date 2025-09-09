import React, { useEffect, useState } from 'react';
import './App.css';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import config from '../amplify_outputs.json';
import { generateClient } from 'aws-amplify/data';

Amplify.configure(config);
const client = generateClient();

const initialFormState = { name: '', description: '' };

function NotesApp() {
  const [formState, setFormState] = useState(initialFormState);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const { data: notes } = await client.models.Note.list();
      setNotes(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }

  async function createNote() {
    if (!formState.name) return;
    try {
      await client.models.Note.create({
        name: formState.name,
        description: formState.description,
        image: ''
      });
      setFormState(initialFormState);
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }

  async function deleteNote({ id }) {
    try {
      await client.models.Note.delete({ id });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  return (
    <div className="notes-app">
      <h1>Your Notes</h1>
      <div className="note-form">
        <input
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          value={formState.name}
          placeholder="Note title"
        />
        <textarea
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
          value={formState.description}
          placeholder="Note description"
          rows={3}
        />
        <button onClick={createNote}>Add Note</button>
      </div>
      <div className="notes">
        {notes.map((note) => (
          <div key={note.id} className="note">
            <h3>{note.name}</h3>
            <p>{note.description}</p>
            <button onClick={() => deleteNote(note)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="app-container">
          <div className="header">
            <span>Welcome, {user.username}</span>
            <button onClick={signOut}>Sign out</button>
          </div>
          <NotesApp />
        </div>
      )}
    </Authenticator>
  );
}
