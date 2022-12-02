import { React, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DocumentLinkComponent = ({ docName, docUuid }) => {
  return (
    <div>
      <Link to={`document/${docUuid}`}>{docName}.pdf</Link>
    </div>
  );
};

export default DocumentLinkComponent;
