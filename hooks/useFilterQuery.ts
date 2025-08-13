import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function useFilterQuery({
	setSearchingName,
	setHideNoImage,
	setChosenDepartment,
}: // setSearchInputValue,
{
	setSearchingName: (val: string) => void
	setHideNoImage: (val: boolean) => void
	setChosenDepartment: (val: string | null) => void
	setSearchInputValue: (val: string) => void
}) {
	const router = useRouter()

	useEffect(() => {
		if (!router.isReady) {
			return
		}

		const { search, hideNoImage: hideNoImageParam, department } = router.query

		if (typeof search === 'string') {
			setSearchingName(search)
			// setSearchInputValue(search)
		}
		if (typeof hideNoImageParam === 'string') {
			setHideNoImage(hideNoImageParam === 'true')
		}
		if (typeof department === 'string') {
			setChosenDepartment(department)
		} else {
			setChosenDepartment(null)
		}
	}, [router.isReady, router.query])
}
