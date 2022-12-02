import axios from 'axios';

export const fetchDocumentService = (uuid) => {
  return axios.get(
    `https://api.dev.classforma.com:5010/task/task_file/get_file?field_key=menu&task_uuid=${uuid}`
  );
};
