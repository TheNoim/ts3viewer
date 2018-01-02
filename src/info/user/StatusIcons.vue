<template>
    <span>
        <v-tooltip bottom v-if="user.online">
            <v-icon color="green" slot="activator" small>call</v-icon>
            <span>Online</span>
        </v-tooltip>
        <v-tooltip bottom v-if="!user.online">
            <v-icon color="red" slot="activator" small>call_end</v-icon>
            <span>Offline</span>
        </v-tooltip>
        <v-tooltip bottom v-if="user.muted.input && user.online">
            <v-icon slot="activator" small>mic_off</v-icon>
            <span>Microphone off</span>
        </v-tooltip>
        <v-tooltip bottom v-if="user.muted.output && user.online">
            <v-icon slot="activator" small>volume_off</v-icon>
            <span>Speaker off</span>
        </v-tooltip>
        <v-tooltip bottom v-if="user.away && user.online">
            <v-icon color="pink" slot="activator" small>location_off</v-icon>
            <span>Currently AFK</span>
        </v-tooltip>
        <v-tooltip bottom v-if="user.channelCommander && user.online">
            <v-icon color="orange" slot="activator" small>mdi-apple-keyboard-command</v-icon>
            <span>Channel Commander (He thinks he is better than you)</span>
        </v-tooltip>
        <v-tooltip bottom v-if="user.recording && user.online">
            <v-icon color="red" slot="activator" small>fiber_manual_record</v-icon>
            <span>H3 IS R3CORD1NG!!!11!1!</span>
        </v-tooltip>
    </span>
</template>

<script>
	export default {
		name: "status-icons",
        props: ['user']
	}
</script>

<style scoped>

</style>