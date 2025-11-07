define(['angular', 'components/shared/powerschoolModule', 'components/cdolServices/index'], angular => {
	'use strict'

	const extCirModule = angular.module('extCirModule', ['powerSchoolModule', 'cdolServicesMod'])

	extCirModule.controller('extCirController', function ($http, $q, formatService) {
		const vm = this

		vm.loadData = () => {
			vm.allSelected = true
			const preload = {
				stuData: $http.get('data/extenuatingCircumstances.json')
			}

			$q.all(preload).then(preload => {
				vm.stuData = preload.stuData?.data ?? []
				vm.stuData.forEach(stu => {
					stu.selected = true
				})

				// Helper methods for counts used in the template
				vm.countSelected = () => {
					if (!vm.stuData) return 0
					return vm.stuData.reduce((acc, s) => acc + (s.selected ? 1 : 0), 0)
				}

				vm.countSelectedWith = field => {
					if (!vm.stuData) return 0
					return vm.stuData.reduce((acc, s) => acc + (s.selected && s[field] ? 1 : 0), 0)
				}
			})
		}

		vm.toggleAll = () => {
			vm.stuData.forEach(s => {
				s.selected = vm.allSelected
			})
		}
		vm.clearSelected = type => {
			let selectedStudents = vm.stuData.filter(s => s.selected && (type === 'Absences' ? s.extenuating_absences : type === 'Tardies' ? s.extenuating_tardies : true))

			let dialogContent = null
			let dialogMessage = `Are you sure you want to clear the selected extenuating ${type ? type : 'Circumstances'} for ${selectedStudents.length} students?`
			dialogContent = $j('#editDiv').detach()

			psDialog({
				content: dialogContent,
				title: `Clear Extenuating ${type ? type : 'Circumstances'}?`,
				type: 'dialogM',
				draggable: true,
				buttons: [
					{ id: 'cancelEditBtn', text: 'Cancel', click: () => psDialogClose() },
					{
						id: 'saveEditBtn',
						text: 'Save',
						click: () => {
							loadingDialog()
							let recordsProcessed = 0

							setLoadingDialogTitle(`${recordsProcessed} of ${selectedStudents.length}`)
							const updatePromises = selectedStudents.map(stu => {
								console.log('totalRecs:', selectedStudents.length, 'recordsProcessed:', recordsProcessed)
								let payload = { tables: { u_student_additional_info: {} } }
								const fields = type === 'Absences' ? ['extenuating_absences'] : type === 'Tardies' ? ['extenuating_tardies'] : ['extenuating_absences', 'extenuating_tardies']
								fields.forEach(f => {
									payload.tables.u_student_additional_info[f] = formatService.formatChecksForApi(false)
								})
								return $http({
									url: `/ws/schema/table/u_student_additional_info/${stu.dcid}`,
									method: 'PUT',
									data: payload,
									headers: { 'Content-Type': 'application/json' }
								}).then(() => {
									recordsProcessed++
									updateLoadingDialogPercentComplete(recordsProcessed)
								})
							})

							$q.all(updatePromises).then(() => {
								closeLoading()
								psDialogClose()
								vm.loadData()
							})
						}
					}
				],
				close: () => $j('#dialogContainer').append(dialogContent)
			})
		}
		vm.loadData()
	})
})
