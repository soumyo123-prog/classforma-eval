import axios from 'axios';

export const fetchDocumentsService = () => {
  return axios.get('https://api.dev.classforma.com:5010/get_app_tasks?app_id=menu_parser');
};
