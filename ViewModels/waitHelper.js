// waitHelper.js
let externalResolver = null;
let setModalVisible = null;

export const configureModalTrigger = (setter) => {
  setModalVisible = setter;
};

export const waitForUserDecision = () => {
  if (setModalVisible) setModalVisible(true);
  return new Promise((resolve) => {
    externalResolver = resolve;
  });
};
export const resolveUserDecision = (decision, payload = null) => {
  if (externalResolver) {
    externalResolver({ decision, payload });
    externalResolver = null;
  }
  if (setModalVisible) setModalVisible(false);
};

