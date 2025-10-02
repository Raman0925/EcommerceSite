import Image from 'next/image';
import contact from '@/assets/contact.webp';

const Contact = () => {
    return (
        <div className="flex flex-col items-center justify-center p-9">
            <h1 className="text-5xl font-medium text-center text-gray-800 mb-9">Contact Information</h1>
            <p className='text-center text-gray-600 mb-6 text-xl'>Contact us via chat box, and we are super happy to help.</p>
            <p className=' text-gray-600 mb-6 text-lg'>Or drop us an email on contact@amuzo.in. Or reach us on 9123355004</p>
            <Image className='mx-auto rounded-xl max-w-2xl shadow-lg' src={contact} alt="family illustration" />
        </div>
    )
}
export default Contact;