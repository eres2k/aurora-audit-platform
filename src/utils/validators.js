export const validateQuestion = (question) => {
  if (!question.text) return 'Question text is required';
  if (!['text', 'number', 'boolean', 'select'].includes(question.type)) {
    return 'Invalid question type';
  }
  return null;
};
