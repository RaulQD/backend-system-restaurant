
import server from './server.js';

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
