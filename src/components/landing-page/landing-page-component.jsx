import { React, useEffect, useState } from 'react';

import { fetchDocumentsService } from '../../services/fetch-documents-service';
import DocumentLinkComponent from '../document-link/document-link-component';

import styles from './landing-page-component.module.css';

const LandingPageComponent = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocumentsService().then((response) => {
      const tasks = response.data.tasks;
      const strippedTasks = [];
      tasks.forEach((task) => {
        strippedTasks.push({
          name: task.task_name,
          uuid: task.task_uuid
        });
      });
      setDocuments(strippedTasks);
    });
  }, []);

  return (
    <>
      <header className={styles.landing_page_header}>
        <h1 className={styles.landing_page_heading}>Documents</h1>
        <hr />
      </header>
      <ul className={styles.document_links_container}>
        {documents.map((document) => {
          return (
            <li key={document.uuid} className={styles.document_link_container}>
              <DocumentLinkComponent docName={document.name} docUuid={document.uuid} />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default LandingPageComponent;
