// Computes what the floating speech bubble / CharacterReaction should show after a step evaluation.
// This module is pure glue — no rendering, no state of its own.

function characterForStep(step) {
  return step?.character || 'pip';
}

function feedbackForResult(step, result) {
  const isSuccess = result.medal !== 'none';
  return {
    character: characterForStep(step),
    characterState: isSuccess ? 'celebrate' : 'react',
    message: isSuccess ? step.feedback?.success : step.feedback?.failure,
    flash: isSuccess ? 'success' : 'failure',
  };
}

function speakingFeedback(step, message) {
  return {
    character: characterForStep(step),
    characterState: 'speaking',
    message,
    flash: null,
  };
}

const FeedbackManager = { characterForStep, feedbackForResult, speakingFeedback };

export default FeedbackManager;
export { characterForStep, feedbackForResult, speakingFeedback };
