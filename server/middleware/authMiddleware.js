const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        return res.status(401).json({ message: "Пожалуйста, авторизуйтесь" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);// Замените на свой ключ
        req.user = decoded;
        if (decoded.exp < Date.now() / 1000) {
          return res.status(401).json({ message: "Срок действия токена истек" });
      }
        next();
    } catch (error) {
      console.error("ошибка при верификации токена:", error);
        return res.status(401).json({ message: "Неверный токен" });
    }
};

function adminMiddleware(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Доступ запрещен" });
    }
    next();
}

module.exports = { authMiddleware, adminMiddleware };
