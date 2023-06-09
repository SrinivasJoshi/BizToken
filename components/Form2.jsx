import { useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { TOKEN_ABI, BIZ_TOKEN_ADDRESS } from '../constant';

const Form2 = () => {
	const [inputVal, setInputVal] = useState('');
	const [answer, setAnswer] = useState(null);

	const { data } = useContractRead({
		address: BIZ_TOKEN_ADDRESS,
		abi: TOKEN_ABI,
		functionName: 'balanceOf',
		args: [inputVal],
		chainId: 80001,
		onError: (error) => {
			if (error.reason !== 'resolver or addr is not configured for ENS name') {
				alert('yo' + error.reason);
				setInputVal('');
			}
		},
	});

	const submitForm = () => {
		if (inputVal.length === 0) {
			alert('Please enter a valid wallet address');
			return;
		}
		setAnswer(Number(data));
	};

	return (
		<div className='flex flex-col items-left mx-5 my-4 md:my-0 basis-2'>
			<h2 className='text-2xl mb-5 text-blue-700 font-semibold'>
				Check Balance
			</h2>
			<p>Enter your wallet address to know your BIZ Token balance</p>
			<input
				type='text'
				placeholder='0xFe..432'
				className='rounded-md border-2 border-blue-400 bg-transparent mt-3 focus:border-blue-700 focus:outline-none p-2 w-64'
				onChange={(e) => setInputVal(e.target.value)}
			/>

			<button
				className='shadow-md md:shadow-lg shadow-blue-700 rounded-lg my-3 border border-blue-700 w-36 p-2 disabled:cursor-not-allowed'
				onClick={submitForm}>
				Submit
			</button>

			{answer !== null && (
				<p className='text-xl text-blue-600 font-semibold self-center mt-5'>
					{answer}
				</p>
			)}
		</div>
	);
};

export default Form2;
