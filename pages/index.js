import Card from '../components/Card';
import Form1 from '../components/Form1';
import Form2 from '../components/Form2';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function HomePage() {
	return (
		<section className='flex flex-col items-center justify-evenly min-h-screen bg-gray-900 text-white'>
			<h1 className='text-2xl md:text-3xl text-blue-700 font-bold mt-5 md:mt-0'>
				BIZ Token
			</h1>
			<ConnectButton showBalance={false} />
			<div className='flex justify-evenly items-center mt-8 md:mt-0'>
				<Card fetchStr='Total Supply of BIZ' />
				<Card fetchStr='BIZ burn rate per day' />
				<Card fetchStr='Hourly token dispersal' />
			</div>
			<div className='flex flex-col md:flex-row justify-around items-center mt-5 md:mt-0'>
				<Form1 />
				<Form2 />
			</div>
		</section>
	);
}

export default HomePage;
