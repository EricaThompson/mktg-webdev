/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import style from './style.module.css'
export interface SearchProps {
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onProfileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Search({
	onInputChange,
	onProfileChange,
}: SearchProps) {
	return (
		<>
			<input
				type="text"
				placeholder="Search people by name"
				onChange={onInputChange}
			/>

			<div className={style['checkbox-container']}>
				<input
					id="hide-no-profile"
					type="checkbox"
					onChange={onProfileChange}
				/>
				<label htmlFor="hide-no-profile">
					Hide people missing a profile image
				</label>
			</div>
		</>
	)
}
