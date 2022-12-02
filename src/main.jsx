import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GlobalWorkerOptions } from 'pdfjs-dist';

import DocumentBodyComponent from './components/document-body/document-body-component';
import LandingPageComponent from './components/landing-page/landing-page-component';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/build/pdf.worker.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPageComponent />
  },
  {
    path: 'document/:id',
    element: <DocumentBodyComponent />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
