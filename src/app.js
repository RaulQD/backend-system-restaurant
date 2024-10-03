
import server from './server.js';

const PORT = process.env.MYSQL_PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})