import UserAvailability from "../models/userAvailability.model";
import User from "../models/user.model";
import { MESSAGES } from "../constants/messages";

/**
 * Create User Availability
 */
export const createUserAvailabilityService = async (data: {
  user_id: number;
  days_of_week:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  start_time: string;
  end_time: string;
}) => {
  const { user_id, days_of_week, start_time, end_time } = data;

  // Verify user exists
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Validate time format (HH:MM:SS or HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    throw new Error(MESSAGES.INVALID_TIME_FORMAT);
  }

  // Check if start_time is before end_time
  const start = new Date(`2000-01-01T${start_time}`);
  const end = new Date(`2000-01-01T${end_time}`);
  if (start >= end) {
    throw new Error(MESSAGES.START_TIME_MUST_BE_BEFORE_END_TIME);
  }

  // Create availability
  const availability = await UserAvailability.create({
    user_id,
    days_of_week,
    start_time,
    end_time,
  });

  return {
    message: MESSAGES.USER_AVAILABILITY_CREATED,
    availability: {
      id: availability.id,
      user_id: availability.user_id,
      days_of_week: availability.days_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    },
  };
};

/**
 * Get User Availability by User ID
 */
export const getUserAvailabilityService = async (userId: number) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find all availability records for the user
  const availability = await UserAvailability.findAll({
    where: { user_id: userId },
    order: [["days_of_week", "ASC"] /* Order by day: monday, tuesday, etc. */],
  });

  return {
    message: MESSAGES.USER_AVAILABILITY_FETCHED,
    availability,
  };
};

/**
 * Get User Availability by ID
 */
export const getUserAvailabilityByIdService = async (
  availabilityId: number,
  userId: number
) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find availability record
  const availability = await UserAvailability.findOne({
    where: {
      id: availabilityId,
      user_id: userId,
    },
  });

  if (!availability) {
    throw new Error(MESSAGES.USER_AVAILABILITY_NOT_FOUND);
  }

  return {
    message: MESSAGES.USER_AVAILABILITY_FETCHED,
    availability: {
      id: availability.id,
      user_id: availability.user_id,
      days_of_week: availability.days_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    },
  };
};

/**
 * Update User Availability
 */
export const updateUserAvailabilityService = async (data: {
  availability_id: number;
  user_id: number;
  days_of_week?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  start_time?: string;
  end_time?: string;
}) => {
  const { availability_id, user_id, days_of_week, start_time, end_time } = data;

  // Verify user exists
  const user = await User.findByPk(user_id);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find availability record
  const availability = await UserAvailability.findOne({
    where: {
      id: availability_id,
      user_id: user_id,
    },
  });

  if (!availability) {
    throw new Error(MESSAGES.USER_AVAILABILITY_NOT_FOUND);
  }

  // Validate time format if provided
  if (start_time || end_time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;
    const start = start_time || availability.start_time;
    const end = end_time || availability.end_time;

    if (start_time && !timeRegex.test(start_time)) {
      throw new Error(MESSAGES.INVALID_START_TIME_FORMAT);
    }
    if (end_time && !timeRegex.test(end_time)) {
      throw new Error(MESSAGES.INVALID_END_TIME_FORMAT);
    }

    // Check if start_time is before end_time
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    if (startDate >= endDate) {
      throw new Error(MESSAGES.START_TIME_MUST_BE_BEFORE_END_TIME);
    }
  }

  // Update fields
  if (days_of_week !== undefined) {
    availability.days_of_week = days_of_week;
  }
  if (start_time !== undefined) {
    availability.start_time = start_time;
  }
  if (end_time !== undefined) {
    availability.end_time = end_time;
  }

  await availability.save();

  return {
    message: MESSAGES.USER_AVAILABILITY_UPDATED,
    availability: {
      id: availability.id,
      user_id: availability.user_id,
      days_of_week: availability.days_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    },
  };
};

/**
 * Delete User Availability
 */
export const deleteUserAvailabilityService = async (
  availabilityId: number,
  userId: number
) => {
  // Verify user exists
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Find and delete availability record
  const availability = await UserAvailability.findOne({
    where: {
      id: availabilityId,
      user_id: userId,
    },
  });

  if (!availability) {
    throw new Error(MESSAGES.USER_AVAILABILITY_NOT_FOUND);
  }

  await availability.destroy();

  return {
    message: MESSAGES.USER_AVAILABILITY_DELETED,
  };
};
