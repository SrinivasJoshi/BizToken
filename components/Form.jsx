import { useState, useEffect } from 'react';
import {
	usePrepareContractWrite,
	useContractWrite,
	useAccount,
	useContractRead,
} from 'wagmi';
import { TOKEN_ABI, BIZ_TOKEN_ADDRESS } from '../constant';
import Loader from './Loader';

const Form = ({ fetchStr, description }) => {
	const { address } = useAccount();
	const [inputVal, setInputVal] = useState(address | '');
	const [loading, setLoading] = useState(false);
	const [answer, setAnswer] = useState(null);

	const { data } = useContractRead({
		address: BIZ_TOKEN_ADDRESS,
		abi: TOKEN_ABI,
		functionName: 'balanceOf',
		args: [inputVal],
		chainId: 80001,
		onError(error) {
			alert('Error', error?.message);
		},
		onSuccess(data) {
			setAnswer(Number(data));
		},
	});

	const { config, isLoading: isLoading2 } = usePrepareContractWrite({
		address: BIZ_TOKEN_ADDRESS,
		abi: TOKEN_ABI,
		functionName: 'requestTokens',
		args: [inputVal],
		chainId: 80001,
		onError(error) {
			alert('Error', error?.message);
		},
	});
	const { write } = useContractWrite(config);

	const requestTokens = () => {
		write?.();
	};

	const submitForm = () => {
		setLoading(true);
		if (inputVal.length === 0) {
			alert('Input cannot be empty');
		}
		if (fetchStr === 'Faucet') {
			requestTokens();
		} else {
			fetchAccountBalance();
		}
		setLoading(false);
	};

	useEffect(() => {
		if (loading) {
			console.log('check');
		}
	}, [loading]);

	return (
		<div className='flex flex-col items-left mx-5 my-4 md:my-0 basis-2'>
			<h2 className='text-2xl mb-5 text-blue-700 font-semibold'>{fetchStr}</h2>
			<p>{description}</p>
			<input
				type='text'
				placeholder='0xFe..432'
				className='rounded-md border-2 border-blue-400 bg-transparent mt-3 focus:border-blue-700 focus:outline-none p-2 w-64'
				onChange={(e) => setInputVal(e.target.value)}
			/>
			{fetchStr === 'Faucet' && (
				<button
					className='shadow-md md:shadow-lg shadow-blue-700 rounded-lg my-3 border border-blue-700 w-36 p-2 disabled:cursor-not-allowed'
					onClick={submitForm}
					disabled={loading}>
					Request Tokens
				</button>
			)}

			{answer !== null && (
				<p className='text-xl text-blue-600 font-semibold self-center mt-5'>
					{answer}
				</p>
			)}
			{/* {isError && (
				<p className='text-red-600 font-semibold self-center'>
					{error?.message}
				</p>
			)} */}
			{loading || isLoading2 ? <Loader /> : ''}
		</div>
	);
};

export default Form;
