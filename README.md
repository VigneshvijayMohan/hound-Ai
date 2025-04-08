# Hound Chrome Extension with LLM Integration

A Chrome extension that allows users to select any text on a webpage and process it using AI. It sends the selected text and current URL to a Django backend integrated with Hugging Face models. The response—such as summaries, generated text, or context insights—is displayed in a floating bubble above the selected text.

## 🔧 Tech Stack

- **Frontend**: JavaScript, HTML, CSS, Chrome Extension APIs (Manifest V3)
- **Backend**: Django REST Framework
- **AI**: Hugging Face Transformers

## ✨ Key Features

- Process selected text via right-click or toggle
- Floating bubble UI for AI-generated responses
- Configurable backend URL
- Summarization, generation, and context analysis
- Persistent settings and graceful error handling

## 📦 Architecture

- **Content Script**: Handles text selection and displays the bubble
- **Background Script**: Sends/receives data from the backend
- **Popup**: Lets users toggle the extension and set the backend URL
- **Django Backend**: Receives input, processes it with Hugging Face, returns result

## 🧪 Future Ideas

- Image/text hybrid processing
- Offline mode with smaller models
- User-selectable AI models

---

> This is a lightweight AI-powered extension for quick and contextual understanding of web content.
