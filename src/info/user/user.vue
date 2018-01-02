<template>
    <div v-if="user" :style="bStyle" class="zUp">
        <v-layout :style="aStyle" class="avatarHead" align-center justify-center column fill-width wrap>
            <v-avatar v-if="user.hasAvatar" :size="'256'" class="elevation-5 userStyle avatarStyle" :tile="true">
                <img v-lazy="`/avatar/dbid/${user.dbid}`" class="clientAvatar" :alt="`${user.nickname} avatar`"/>
            </v-avatar>
            <avatar v-if="!user.hasAvatar" class="elevation-5 userStyle avatarStyle" :size="200" :username="user.nickname"
                    :alt="`${user.nickname} avatar`"></avatar>
            <h1>{{user.nickname}} <status-icons class="makeClickable" :user="user"/></h1>
        </v-layout>
        <v-container class="makeClickable">
            <v-divider></v-divider>
            <h2>Description: </h2>
            <code>{{user.description || 'No description'}}</code>
            <h2>Online: </h2>
            <span class="goAway"></span>
            <v-tooltip bottom v-if="user.online">
                <v-icon color="green" slot="activator" small>call</v-icon>
                <span>Online</span>
            </v-tooltip>
            <v-tooltip bottom v-if="!user.online">
                <v-icon color="red" slot="activator" small>call_end</v-icon>
                <span>Offline</span>
            </v-tooltip>
            <h2>Country: </h2>
            <code>{{user.country || 'Unknown'}}</code>
            <h2>Last time connected: </h2>
            <code>{{formatTime(user.lastconnected)}}</code>
            <h2>First time connected: </h2>
            <code>{{formatTime(user.created)}}</code>
            <h2>Last known ip: </h2>
            <code>{{user.lastIP}}</code>
            <h2>Version & Platform: </h2>
            <v-layout row>
                <code>{{user.version}}</code>
                <span class="goAway"></span>
                <v-tooltip bottom v-if="user.platform === 'Windows'">
                    <v-icon slot="activator" small>mdi-windows</v-icon>
                    <span>A windoof user</span>
                </v-tooltip>
                <v-tooltip bottom v-if="user.platform === 'OS X'">
                    <v-icon slot="activator" small>mdi-desktop-mac</v-icon>
                    <span>A fapintosh user</span>
                </v-tooltip>
                <v-tooltip bottom v-if="user.platform === 'iOS'">
                    <v-icon slot="activator" small>mdi-apple-ios</v-icon>
                    <span>Stupid mobile user</span>
                </v-tooltip>
                <v-tooltip bottom v-if="user.platform === 'Android'">
                    <v-icon slot="activator" small>mdi-android</v-icon>
                    <span>Stupid mobile android user</span>
                </v-tooltip>
                <v-tooltip bottom v-if="user.platform === 'Linux'">
                    <v-icon slot="activator" small>mdi-linux</v-icon>
                    <span>Awesome linux</span>
                </v-tooltip>
            </v-layout>
            <h2>Total connections: </h2>
            <code>{{user.connections}}</code>
            <h2>Download Avatar: </h2>
            <v-btn :loading="!avatarFileName" :disabled="!avatarFileName || !user.hasAvatar" :href="avatarURL" :download="avatarFileName">{{user.hasAvatar ? `Download ${avatarFileName}` : 'No avatar available'}}</v-btn>
        </v-container>
    </div>
</template>

<script>
	import Avatar from 'vue-avatar';
	import StatusIcons from './StatusIcons';
	import moment from 'moment';
	import axios from 'axios';

	export default {
		name: "user",
		props: ['user', 'scroll'],
        data() {
		    return {avatarFileName: null, avatarURL: null, aStyle: "", bStyle: ""};
        },
		components: {
			Avatar,
			StatusIcons
		},
        mounted() {
            this.loadAvatarData().catch(console.error);
            this.watchScroll();
        },
        methods: {
			formatTime(time) {
				const t = moment(time);
				if (t.isSame(moment.now(), 'day')) {
					return `Today ${t.format('HH:mm')}`;
                } else {
					return t.format('Do MMM YYYY HH:mm');
                }
            },
            async loadAvatarData() {
				if (!this.$props.user.hasAvatar) {
					this.$set(this.$data, 'avatarFileName', 'nothing');
                } else {
					const {data: avatarData} = await axios.get(`/avatar/info/dbid/${this.$props.user.dbid}`);
					const filename = `${this.$props.user.nickname}.${avatarData.mimeInfo.extensions[0]}`;
					const url = `/avatar/dbid/${this.$props.user.dbid}`;
					this.$set(this.$data, 'avatarURL', url);
					this.$set(this.$data, 'avatarFileName', filename);
                }
            },
            watchScroll() {
                this.$watch('scroll', () => {
	                // y=mx+b
                	let w = (-0.01*this.scroll)+1;
                	if (w <= 0) {
		                w = 0;
		                this.$set(this.$data, 'bStyle', `z-index: 0 !important;`)
                    } else {
		                this.$set(this.$data, 'bStyle', '')
                    }
                	if (w > 1) w = 1;
                	this.$set(this.$data, 'aStyle', `opacity: ${w};`)
                });
            }
        }
	}
</script>

<style scoped>
    .clientAvatar {
        object-fit: fill;
    }

    .userStyle {
        z-index: 9999999;
        background-color: white;
    }

    .zUp {
        z-index: 9999999;
        pointer-events: none;
    }

    .avatarStyle {
        padding-top: -100px;
    }

    .goAway {
        min-width: 5px;
    }

    .avatarHead {
        min-height: 240px;
    }

    .makeClickable {
        pointer-events: all;
    }
</style>