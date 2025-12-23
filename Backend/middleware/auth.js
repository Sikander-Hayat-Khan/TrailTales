import jwt from "jsonwebtoken";
//authentication
async function authorization(req, res, next) {
  if (!req.cookies.token) {
    return res.status(401).json({ msg: "Not authorized" });
  }
  try {
    const token = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = token;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Not authorized" });
  }
}

export default authorization;
