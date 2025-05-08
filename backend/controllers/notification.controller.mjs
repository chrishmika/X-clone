import Notification from "../models/notification.model.mjs";

//get all notifications and mark them as read
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).sort({ creatdAt: -1 }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("error in getNotification", error.message);
    return res.status(500).json({ error: "internal server error on notification controller" });
  }
};

//delete all notifications under the user
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "All notifications delete sucessfull" });
  } catch (error) {
    console.log("error in deleteNotification", error.message);
    return res.status(500).json({ error: "internal server error on notification controller" });
  }
};

//delete selected notification under the user
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: "notification not found" });
    }

    if (notification.to.toString !== userId.toString()) {
      return res.status(403).json({ error: "not authorized to delete thisnotification" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "notification delete sucessfull" });
  } catch (error) {
    console.log("error in deleteNotification", error.message);
    return res.status(500).json({ error: "internal server error on notification controller" });
  }
};

//view one and mark it as read
export const viewNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const isNotification = await Notification.findById(notificationId);
    if (!isNotification) {
      return res.status(404).json({ error: "notification not found" });
    }

    const update = await Notification.findByIdAndUpdate(notificationId, { read: true });

    res.status(200).json(update);
  } catch (error) {
    console.log("error in viewNotification", error.message);
    return res.status(500).json({ error: "internal server error on notification controller" });
  }
};
