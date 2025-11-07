define(['angular', 'components/shared/powerschoolModule'], angular => {
	'use strict'
	const ecModule = angular.module('ecModule', ['powerschoolModule'])

	ecModule.controller('ecCtrl', function ($http) {
		const vm = this

		vm.extenuatingCircumstancesList = 'hi folks'

		const preload = {
			students: $http.get('studentsWithExtenuatingCircumstances.json')
		}
	})

	return ecModule
})
