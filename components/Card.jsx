import { useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import { TOKEN_ABI, BIZ_TOKEN_ADDRESS } from '../constant';
import Loader from './Loader';

const Card = ({ fetchStr }) => {
	const [value, setValue] = useState(null);

	const fetchTotalSupply = async () => {
		const data1 = await readContract({
			address: BIZ_TOKEN_ADDRESS,
			abi: TOKEN_ABI,
			functionName: 'totalSupply',
			chainId: 80001,
		});
		setValue(Number(data1));
	};

	const fetchBurnRate = async () => {
		const data1 = await readContract({
			address: BIZ_TOKEN_ADDRESS,
			abi: TOKEN_ABI,
			functionName: 'burnAmount',
			chainId: 80001,
		});
		setValue(Number(data1));
	};

	const fetchDispersalRate = async () => {
		const data1 = await readContract({
			address: BIZ_TOKEN_ADDRESS,
			abi: TOKEN_ABI,
			functionName: 'mintAmount',
			chainId: 80001,
		});
		setValue(Number(data1));
	};

	useEffect(() => {
		if (fetchStr === 'Total Supply of BIZ') {
			fetchTotalSupply();
		}
		if (fetchStr === 'BIZ burn rate per day') {
			fetchBurnRate();
		}
		if (fetchStr === 'Hourly token dispersal') {
			fetchDispersalRate();
		}
	}, []);

	return (
		<div className='flex flex-col items-center mx-5 basis-1/4 font-semibold'>
			<h2 className='text-lg md:text-xl mb-5 text-center'>{fetchStr}</h2>
			<p className='text-lg md:text-xl text-blue-700'>{value}</p>
			{value === null && <Loader />}
		</div>
	);
};

export default Card;
