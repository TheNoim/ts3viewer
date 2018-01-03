import 'babel-polyfill';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Index from './index.vue';
import 'vuetify/dist/vuetify.min.css';
import 'mdi/css/materialdesignicons.min.css';
import settings from '../../view/settings';
import VueImg from 'v-img';
import Lazy from 'vue-lazy-image';

Vue.use(Vuetify);
Vue.use(VueImg, {sourceButton: true});
Vue.use(Lazy);

if (getParameterByName('dark') === 'true') {
    settings.darkMode = true;
}

if (getParameterByName('light') || getParameterByName('dark') === 'false') {
    settings.darkMode = false;
}

new Vue({
    el: '#app',
    render: h => h(Index),
    data() {
        return settings;
    }
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}