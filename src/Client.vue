<template>
    <transition name="fade">
        <div>
            <v-list-tile avatar @click="info = true">
                <v-list-tile-avatar>
                    <v-tooltip bottom>
                        <v-icon color="red" slot="activator" v-if="!client.hasAvatar">face</v-icon>
                        <span>{{client.nickname}} has no Avatar :(</span>
                    </v-tooltip>
                    <img v-if="client.hasAvatar" v-img v-bind:src="`/avatar/dbid/${client.dbid}`" class="clientAvatar" :alt="`${client.nickname} avatar`"/>
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>{{client.nickname}}</v-list-tile-title>
                    <v-list-tile-sub-title>
                        <v-tooltip bottom v-if="client.muted.input">
                            <v-icon slot="activator" small>mic_off</v-icon>
                            <span>Microphone off</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.muted.output">
                            <v-icon slot="activator" small>volume_off</v-icon>
                            <span>Speaker off</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.away">
                            <v-icon slot="activator" small>location_off</v-icon>
                            <span>Currently AFK</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.platform === 'Windows'">
                            <v-icon slot="activator" small>mdi-windows</v-icon>
                            <span>A windoof user</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.platform === 'OS X'">
                            <v-icon slot="activator" small>mdi-desktop-mac</v-icon>
                            <span>A fapintosh user</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.platform === 'iOS'">
                            <v-icon slot="activator" small>mdi-apple-ios</v-icon>
                            <span>Stupid mobile user</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.platform === 'Android'">
                            <v-icon slot="activator" small>mdi-android</v-icon>
                            <span>Stupid mobile android user</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.channelCommander">
                            <v-icon color="orange" slot="activator" small>mdi-apple-keyboard-command</v-icon>
                            <span>Channel Commander (He thinks he is better than you)</span>
                        </v-tooltip>
                        <v-tooltip bottom v-if="client.recording">
                            <v-icon color="red" slot="activator" small>fiber_manual_record</v-icon>
                            <span>H3 IS R3CORD1NG!!!11!1!</span>
                        </v-tooltip>
                    </v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <client-details :show="info" :client="client" v-on:close="close()"></client-details>
        </div>
    </transition>
</template>

<script>
    import ClientDetails from './ClientDetails';

	export default {
		name: "client",
        props: {
			client: Object
        },
        data() {
			return {info: false, avatar: null};
        },
        methods: {
			bbcode(string) {
				return BBCode.render(string ? string : '', {newLine: false});
            },
            close() {
                this.$set(this.$data, 'info', false);
            }
        },
        components: {ClientDetails}
	}
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0
    }

    .clientAvatar {
        object-fit: contain;
    }
</style>