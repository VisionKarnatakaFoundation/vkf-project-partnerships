# VKF Project Partnerships

A standalone Vision Karnataka Foundation project partnership website, separate from the Bagalkote Jute Cluster marketplace.

## Experience

- Browse 50 proposed project options across five themes, with project icons and images.
- Search and filter projects, or sort by pilot budget.
- Open a project to review its intended participants, funded inputs, pilot budget, planned results and continuation model.
- Choose a contribution and proceed to a QR / bank instructions page, retaining the project and amount.
- View the proposed 80% delivery, 10% coordination and 10% VKF shared operations allocation.

The portfolio presents proposed six-month pilots. Budgets and participant counts are planning estimates, with final scope and costs to be confirmed with VKF before commitment. Images illustrate project concepts.

## Run locally

The website is plain HTML, CSS and JavaScript. No build or dependency installation is required.

From this repository directory, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html`: page shell and VKF identity.
- `styles.css`: responsive design.
- `data.js`: all 50 project records and five themes.
- `icons.js`: SVG interface and project icons.
- `app.js`: catalogue, project details, contribution selection and payment routes.
- `payment-config.js`: confirmed institutional payment configuration.
- `assets/`: locally served project images, logo and favicon.

## Payment activation

Payments are currently unavailable. VKF's confirmed institutional QR and bank details have not been supplied. The website shows that state clearly and does not display sample payment credentials.

To enable payment instructions, update `payment-config.js` with verified receiving details:

```js
window.VKFPayments = {
  verified: false,
  qrImage: null,
  qrPayeeName: null,
  bank: null
};
```

Add the official QR image under `assets/` and set its local path in `qrImage`. Set `qrPayeeName` to the actual payee name. For bank transfer, `bank` needs `beneficiary`, `bankName`, `accountNumber`, `ifsc`, and an optional `branch`. Set `verified: true` only after confirming VKF's receiving account and QR.

This static website does not collect card or banking credentials, verify transactions, issue receipts or store donor personal details. Transfers happen in the donor's own bank or UPI app. Donors can initiate an email to VKF with a project reference for manual reconciliation.

## Hosting

The existing private review site is at https://vkf-project-partnerships.abhilash1991.chatgpt.site.

This repository places the deployable website at the repository root. If GitHub Pages is enabled later, select the default branch and `/ (root)` as the publishing source. `.nojekyll` keeps the static assets unchanged. Creating this repository does not enable public hosting or alter the Jute Cluster website.
