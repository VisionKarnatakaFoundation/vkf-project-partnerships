/* Populate only with VKF-confirmed institutional receiving details.
   Set verified to true only after the account/QR and payee name are checked.
   No payment completion is inferred or confirmed by this static website. */
window.VKFPayments = {
  verified: false,
  qrImage: null,
  qrPayeeName: null,
  bank: null
  /* bank: {
    beneficiary: "", bankName: "", accountNumber: "", ifsc: "", branch: ""
  } */
};
