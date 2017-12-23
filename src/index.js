import 'babel-polyfill';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Index from './index.vue';
import 'vuetify/dist/vuetify.min.css';
import 'mdi/css/materialdesignicons.min.css';
import settings from './settings';

Vue.use(Vuetify);

new Vue({
	el: '#app',
	render: h => h(Index),
	data() {
		return settings;
	}
});