<template>
    <v-list two-line v-bind:class="[move ? move : '']">
        <template v-for="channel in channels">
            <channel v-bind:key="channel.id" v-bind:channel="channel"></channel>
        </template>
    </v-list>
</template>

<script>
	import channel from './Channel';
	export default {
		name: "tree",
        components: {channel},
        props: {
			channels: Array
        }
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
</style>