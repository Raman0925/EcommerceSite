import Image from 'next/image';
import contact from '@/assets/contact.webp';
const ShippingPolicy = () => {
    return (
        <div className="flex flex-col  max-w-3xl mx-auto px-4 py-10 bg-gray-100">
            <h1 className="text-5xl font-medium text-center text-gray-800 mb-4">Shipping Policy</h1>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">🚚 Shipping & Delivery Policy</h3>
            <p className="text-xl text-gray-600">At Amuzo, we are committed to delivering your orders swiftly and securely. Here’s everything you need to know about our shipping process:</p>
            <br />
            <h3 className="text-2xl font-bold text-left  text-gray-800 mb-4">📦 Order Processing Time</h3>
            <p className="text-xl text-gray-600  before:mr-4 before:content-['•']">  All orders are processed and shipped within 24 to 48 hours of being placed, excluding Sundays and public holidays.</p>
            <p className="text-xl text-gray-600  before:mr-4 before:content-['•']">  Once your order is shipped, you will receive a confirmation email with tracking details.</p>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">🚀 Shipping Time & Charges</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li>
                    <span className="font-semibold text-lg  text-shadow-cyan-950">Standard Delivery: </span> 3–7 business days depending on location.
                </li>
                <li>
                    <span className="font-semibold text-lg">Express Delivery: </span> 1–3 business days.
                </li>
                <li>
                    <span className="font-semibold text-lg">Shipping Charges: </span> Free shipping on all orders
                </li>
            </ul>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">🌎 Delivery Areas</h3>
            <p className="text-xl text-gray-600">We currently deliver across India, including major cities, towns, and most PIN codes.</p>
            <p className="text-xl text-gray-600">For remote locations, delivery times may vary.</p>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">📍 Order Tracking</h3>
            <p className="text-xl text-gray-600">Once your order is shipped, you will receive a tracking link via email or SMS</p>
            <p className="text-xl text-gray-600">You can track your package in real-time and stay updated on its delivery status.</p>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">🔥 Delays & Issues</h3>
            <p className="text-xl text-gray-600">While we strive for timely deliveries, occasional delays due to external factors (weather, courier issues, etc.) may occur.</p>
            <p className="text-xl text-gray-600">If your order is delayed, please reach out to us at:</p>
            <p className="text-xl text-gray-600">📧 contact@amuzo.in</p>
            <p className="text-xl text-gray-600">📞 (+91)9123355004</p>
            <br />
            <h3 className="text-2xl font-bold text-left text-gray-800 mb-4">💛 Need Assistance?</h3>
            <p className="text-xl text-gray-600">For any questions or concerns regarding shipping, feel free to contact us. We’re here to help!</p>
            <br />
            <Image className='mx-auto rounded-xl max-w-2xl shadow-lg' src={contact} alt="family illustration" />
        </div>
    )
}

export default ShippingPolicy;