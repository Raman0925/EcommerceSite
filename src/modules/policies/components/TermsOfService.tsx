const TermsOfService = () => {
  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 py-10 bg-orange-50">
      <h1 className="text-5xl font-medium text-center text-gray-800 mb-4">
        Terms of Service
      </h1>
      <br />
      <p className="text-xl text-gray-600">
        By accessing and using this website, you agree to be bound by the terms
        and conditions set out below. Please read them carefully before placing
        an order or using our services.
      </p>
      <br />
      <ul className="list-disc pl-5 space-y-2 text-lg text-gray-600">
        <li>
          All purchases made on this site are subject to availability and
          confirmation of the order price.
        </li>
        <li>
          You agree to provide current, complete, and accurate purchase and
          account information for all orders placed.
        </li>
        <li>
          We reserve the right to refuse service, terminate accounts, or cancel
          orders at our sole discretion.
        </li>
        <li>
          Use of this site for any unlawful purpose, including fraud or abuse,
          is strictly prohibited.
        </li>
      </ul>
      <br />
      <p className="text-xl text-gray-600">
        If you have any questions about these Terms, please contact us at
        contact@amuzo.in.
      </p>
    </div>
  );
};

export default TermsOfService;
