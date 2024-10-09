
const response = (res,statusCode,data) => {
    return res.status(statusCode).json({
      status:true,
      data,
    })
}

export default response;