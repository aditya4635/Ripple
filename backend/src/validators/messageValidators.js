export const validateMessageInput = ({ text, image }) => {
  const errors = [];

  if (!text?.trim() && !image) {
    errors.push("Message must contain text or an image");
  }

  return { isValid: errors.length === 0, errors };
};

export const validateDeleteType = (type) => {
  const validTypes = ["me", "everyone"];
  if (!validTypes.includes(type)) {
    return { isValid: false, errors: ["Invalid delete type"] };
  }
  return { isValid: true, errors: [] };
};
