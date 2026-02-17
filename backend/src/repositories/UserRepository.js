import User from "../models/User.model.js";

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findByIdSafe(id) {
    return User.findById(id).select("-password");
  }

  async findByIdWithPassword(id) {
    return User.findById(id);
  }

  async findAllExcept(userId) {
    return User.find({ _id: { $ne: userId } }).select("-password");
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true }).select(
      "-password"
    );
  }

  async existsByEmail(email) {
    return User.exists({ email: email.toLowerCase() });
  }
}

export default new UserRepository();
