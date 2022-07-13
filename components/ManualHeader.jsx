import React, { useEffect } from 'react';
import { useMoralis } from 'react-moralis';

const ManualHeader = () => {
	const {
		enableWeb3,
		account,
		isWeb3Enabled,
		Moralis,
		deactivateWeb3,
		isWeb3EnableLoading,
	} = useMoralis();

	useEffect(() => {
		if (isWeb3Enabled) return;

		if (typeof window !== 'undefined') {
			if (window.localStorage.getItem('connected')) {
				enableWeb3();
			}
		}
	}, [isWeb3Enabled]);

	useEffect(() => {
		Moralis.onAccountChanged((latestAccount) => {
			console.log(`Account changed to ${latestAccount}`);
			if (latestAccount === null) {
				window.localStorage.removeItem('connected');
				deactivateWeb3();
				console.log('Null account found');
			}
		});
	}, []);

	return (
		<div>
			{account ? (
				<h1>
					Connected to {account.slice(0, 6)}...
					{account.slice(account.length - 4)}
				</h1>
			) : (
				<button
					onClick={async () => {
						await enableWeb3();
						if (typeof window !== 'undefined') {
							window.localStorage.setItem('connected', 'inject');
						}
					}}
					disabled={isWeb3EnableLoading}
				>
					Connect Wallet
				</button>
			)}
		</div>
	);
};

export default ManualHeader;
