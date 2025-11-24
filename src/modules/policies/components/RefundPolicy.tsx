const RefundPolicy = () => {
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-10 bg-gray-100">
      <h1 className="text-5xl font-medium text-center text-gray-800 mb-4">
        Refund Policy
      </h1>
      <br />
      <p className="text-xl text-gray-600">
        If you are not fully satisfied with your purchase, you may be eligible
        for a refund or replacement, subject to the terms below.
      </p>
      <br />
      <ul className="list-disc pl-5 space-y-2 text-lg text-gray-600">
        <li>
          Items must be unused, in their original packaging, and returned within
          7 days of delivery.
        </li>
        <li>
          Certain items (such as personal care products or custom orders) may
          not be eligible for return due to hygiene or personalization.
        </li>
        <li>
          Once your return is received and inspected, we will notify you of the
          approval or rejection of your refund.
        </li>
        <li>
          Approved refunds will be processed to your original method of payment
          within 5–7 business days.
        </li>
      </ul>
      <br />
      <p className="text-xl text-gray-600">
        For any questions about refunds or returns, please contact us at
        contact@amuzo.in or (+91) 9123355004.
      </p>
    </div>
  );
};

export default RefundPolicy;
