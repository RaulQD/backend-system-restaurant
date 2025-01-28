
export const corsConfig = {
  origin: (origin, callback) => {
    const whileList = [process.env.FRONTEND_URL || 'http://localhost:5173'];
    if (whileList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}