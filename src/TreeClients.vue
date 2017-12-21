<template>
    <v-list two-line class="move" full-width>
        <template v-for="client in clients">
            <div v-bind:key="client.dbid">
                <v-list-tile avatar @click="">
                    <v-list-tile-avatar>
                        <v-icon color="red" v-if="!client.hasAvatar">face</v-icon>
                        <img v-if="client.hasAvatar" v-bind:src="`/avatar/dbid/${client.dbid}`"/>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-html="client.nickname"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="client.platform"></v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </div>
        </template>
    </v-list>
</template>

<script>
	export default {
		name: "treeClients",
		props: {
			clients: Array
		}
	}
</script>

<style scoped>
    .move {
        margin-left: 30px;
    }
</style>