import { React, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchDocumentService } from '../../services/fetch-document-service';
import { base64ToArrayBuffer } from '../../services/base64-to-buffer';

import styles from './document-body-component.module.css';

const DocumentBodyComponent = () => {
  const { id } = useParams();
  const [contentBuffer, setContentBuffer] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [nameCoords, setNameCoords] = useState(null);
  const [teleCoords, setTeleCoords] = useState(null);
  const pageNumRef = useRef();

  useEffect(() => {
    fetchDocumentService(id).then((response) => {
      const content = response.data.content;
      const contentArrayBuffer = base64ToArrayBuffer(content);
      setContentBuffer(contentArrayBuffer);
    });
  }, []);

  useEffect(() => {
    const pdfjsLib = window.pdfjsLib;
    // This was not handled with useState because then we would have to add the
    // variable choosen to the list of dependencies of this useEffect function
    // and it was causing errors due to use of promises.
    let choosen = 0;
    const name = document.getElementById('name');
    const telephone = document.getElementById('telephone');
    name.addEventListener('click', () => {
      choosen = 1;
    });
    telephone.addEventListener('click', () => {
      choosen = 2;
    });

    if (contentBuffer) {
      pdfjsLib.getDocument(contentBuffer).promise.then((pdf) => {
        if (pageNum > pdf.numPages) {
          alert('Page number ' + pageNum + ' does not exist.');
        } else {
          pdf.getPage(pageNum).then((page) => {
            const viewport = page.getViewport({ scale: 1 });

            const canvas = document.getElementById('the-canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
              const img = new Image();
              img.src = canvas.toDataURL();

              initializeNameAnnotation(context);
              initializeTeleAnnotation(context);

              let startX = null;
              let startY = null;
              let rectX = null;
              let rectY = null;
              let isDrawing = false;
              canvas.addEventListener('mousedown', (e) => {
                if (choosen === 0) return;
                startX = e.pageX - e.target.offsetLeft;
                startY = e.pageY - e.target.offsetTop;
                isDrawing = true;
              });
              canvas.addEventListener('mouseup', () => {
                if (choosen === 0) return;
                isDrawing = false;
                if (choosen === 1) {
                  localStorage.setItem(
                    'nameCoords' + id,
                    JSON.stringify({
                      x: startX,
                      y: startY,
                      height: rectY,
                      width: rectX
                    })
                  );
                  setNameCoords({
                    x: startX,
                    y: startY,
                    height: rectY,
                    width: rectX
                  });
                } else if (choosen === 2) {
                  localStorage.setItem(
                    'teleCoords' + id,
                    JSON.stringify({
                      x: startX,
                      y: startY,
                      height: rectY,
                      width: rectX
                    })
                  );
                  setTeleCoords({
                    x: startX,
                    y: startY,
                    height: rectY,
                    width: rectX
                  });
                }
              });
              canvas.addEventListener('mousemove', (e) => {
                if (choosen === 0) return;
                if (isDrawing) {
                  pdf.destroy();
                  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                  context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
                  rectX = e.pageX - e.target.offsetLeft - startX;
                  rectY = e.pageY - e.target.offsetTop - startY;
                  if (choosen == 1) {
                    initializeTeleAnnotation(context);
                    context.strokeStyle = 'rgb(255, 193, 7)';
                    context.fillStyle = 'rgba(255, 193, 7, 8)';
                    context.strokeRect(startX, startY, rectX, rectY);
                  } else if (choosen == 2) {
                    initializeNameAnnotation(context);
                    context.strokeStyle = 'rgb(25, 135, 84)';
                    context.fillStyle = 'rgba(25, 135, 84, 8)';
                    context.strokeRect(startX, startY, rectX, rectY);
                  }
                  context.lineWidth = 3;
                }
              });
            });
          });
        }
      });
    }
  }, [contentBuffer, pageNum]);

  const initializeNameAnnotation = (context) => {
    const nameCoordsString = localStorage.getItem('nameCoords' + id);
    if (nameCoordsString) {
      const nameCoords = JSON.parse(nameCoordsString);
      context.strokeStyle = 'rgb(255, 193, 7)';
      context.fillStyle = 'rgba(255, 193, 7, 8)';
      context.lineWidth = 3;
      context.strokeRect(nameCoords.x, nameCoords.y, nameCoords.width, nameCoords.height);
    }
  };

  const initializeTeleAnnotation = (context) => {
    const teleCoordsString = localStorage.getItem('teleCoords' + id);
    if (teleCoordsString) {
      const teleCoords = JSON.parse(teleCoordsString);
      context.strokeStyle = 'rgb(25, 135, 84)';
      context.fillStyle = 'rgba(25, 135, 84, 8)';
      context.lineWidth = 3;
      context.strokeRect(teleCoords.x, teleCoords.y, teleCoords.width, teleCoords.height);
    }
  };

  const onChangePageNumber = () => {
    setPageNum(parseInt(pageNumRef.current.value));
  };

  const getAnnotationsList = () => {
    const annotationsList = [];
    const nameCoordsString = localStorage.getItem('nameCoords' + id);
    const teleCoordsString = localStorage.getItem('teleCoords' + id);
    if (nameCoordsString) {
      const nameCoords = JSON.parse(nameCoordsString);
      annotationsList.push({ type: 'name', ...nameCoords });
    }
    if (teleCoordsString) {
      const teleCoords = JSON.parse(teleCoordsString);
      annotationsList.push({ type: 'tele', ...teleCoords });
    }
    return annotationsList;
  };

  return (
    <div className={styles.document_body_container}>
      <div className={styles.document_annotation_container}>
        <div className="p-4">
          <div className="h4">
            Select Page Number <hr />
          </div>
          <div className="d-flex">
            <input min="1" type="number" className="form-control" ref={pageNumRef} />
            <button className="btn btn-primary" onClick={onChangePageNumber}>
              Go
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="h4">
            Labels <hr />
          </div>
          <div className="d-flex">
            <button className="btn btn-warning me-3" id="name">
              Name
            </button>
            <button className="btn btn-success" id="telephone">
              Telephone
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="h4">
            Boxes <hr />
          </div>
          <ul className="list-group">
            {getAnnotationsList().map((annotation, idx) => {
              if (annotation.type === 'name') {
                return (
                  <li className="list-group-item" key={idx}>
                    <span className="me-3">
                      x: {annotation.x}, y: {annotation.y}, height: {annotation.height}, width:{' '}
                      {annotation.width}
                    </span>
                    <div className="btn btn-warning">Name</div>
                  </li>
                );
              }
              return (
                <li className="list-group-item" key={idx}>
                  <span className="me-3">
                    x: {annotation.x}, y: {annotation.y}, height: {annotation.height}, width:{' '}
                    {annotation.width}
                  </span>
                  <div className="btn btn-success">Telephone</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className={styles.document_body_canvas_container}>
        <canvas id="the-canvas" className={styles.document_body_canvas}></canvas>
      </div>
    </div>
  );
};

export default DocumentBodyComponent;
