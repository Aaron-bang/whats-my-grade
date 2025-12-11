import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [googleClientId, setGoogleClientId] = useState('');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load saved settings
            const savedClientId = localStorage.getItem('google_client_id') || '';
            const savedApiKey = localStorage.getItem('openai_api_key') || '';
            setGoogleClientId(savedClientId);
            setOpenaiApiKey(savedApiKey);
        }
    }, [isOpen]);

    const handleSave = () => {
        setIsSaving(true);
        // Save to localStorage
        if (googleClientId) {
            localStorage.setItem('google_client_id', googleClientId.trim());
        } else {
            localStorage.removeItem('google_client_id');
        }

        if (openaiApiKey) {
            localStorage.setItem('openai_api_key', openaiApiKey.trim());
        } else {
            localStorage.removeItem('openai_api_key');
        }

        // Simulate a brief delay for better UX
        setTimeout(() => {
            setIsSaving(false);
            onClose();
            // Reload page to ensure new configs take effect immediately
            window.location.reload();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={e => e.stopPropagation()}>
                <h2>API Settings</h2>
                <p className="modal-subtitle">Configure API keys for Gmail and AI features</p>

                <div className="settings-form">
                    <div className="form-group">
                        <label htmlFor="googleClientId">Google OAuth Client ID</label>
                        <input
                            id="googleClientId"
                            type="text"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            placeholder="123...apps.googleusercontent.com"
                        />
                        <p className="form-hint">
                            From <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="form-link">Google Cloud Console</a>
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="openaiApiKey">OpenAI API Key</label>
                        <input
                            id="openaiApiKey"
                            type="password"
                            value={openaiApiKey}
                            onChange={(e) => setOpenaiApiKey(e.target.value)}
                            placeholder="sk-..."
                        />
                        <p className="form-hint">
                            From <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="form-link">OpenAI Dashboard</a>
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save & Reload'}
                    </button>
                </div>
            </div>
        </div>
    );
};
