import { useState } from 'react';
import {
	usePrepareContractWrite,
	useContractWrite,
	useContractEvent,
} from 'wagmi';
import { TOKEN_ABI, BIZ_TOKEN_ADDRESS } from '../constant';
import Loader from './Loader';

const Form1 = () => {
	const [inputVal, setInputVal] = useState('');
	const [loading, setLoading] = useState(false);

	useContractEvent({
		address: BIZ_TOKEN_ADDRESS,
		abi: TOKEN_ABI,
		eventName: 'TokensRequested',
		chainId: 80001,
		listener(receipent, value) {
			alert('Tokens received successfully');
		},
	});

	const { config, isLoading } = usePrepareContractWrite({
		address: BIZ_TOKEN_ADDRESS,
		abi: TOKEN_ABI,
		functionName: 'requestTokens',
		args: [inputVal],
		chainId: 80001,
		onError: (error) => {
			if (error.reason !== 'resolver or addr is not configured for ENS name') {
				alert(error.reason);
				setInputVal('');
			}
		},
	});
	const { write } = useContractWrite(config);

	const submitForm = async () => {
		setLoading(true);
		if (inputVal.length === 0) {
			alert('Address cannot be empty');
			return;
		}
		write?.();
		setLoading(false);
	};

	return (
		<div className='flex flex-col items-left mx-5 my-4 md:my-0 basis-2'>
			<h2 className='text-2xl mb-5 text-blue-700 font-semibold'>Faucet</h2>
			<p>Enter your wallet address to receive BIZ Token</p>
			<input
				type='text'
				value={inputVal}
				placeholder='0xFe..432'
				className='rounded-md border-2 border-blue-400 bg-transparent mt-3 focus:border-blue-700 focus:outline-none p-2 w-64'
				onChange={(e) => setInputVal(e.target.value)}
			/>
			<button
				className='shadow-md md:shadow-lg shadow-blue-700 rounded-lg my-3 border border-blue-700 w-36 p-2 disabled:cursor-not-allowed'
				onClick={submitForm}
				disabled={isLoading}>
				Request Tokens
			</button>
			{loading && <Loader />}
		</div>
	);
};

export default Form1;
