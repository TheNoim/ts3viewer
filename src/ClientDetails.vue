<template>
    <v-dialog v-model="isOpen" lazy max-width="500px">
        <v-card>
            <v-card-title>
                <h3>Details of {{client.nickname}}</h3>
            </v-card-title>
            <v-card-text>
                <v-layout justify-center align-content-center align-center v-if="client.hasAvatar">
                    <img :tile="true" :src="`/avatar/dbid/${client.dbid}`" v-img :alt="`${client.nickname} avatar`" class="clientAvatar">
                </v-layout>
                <v-expansion-panel popout focusable expand>
                    <v-expansion-panel-content lazy ripple v-if="client.description">
                        <div slot="header">Description</div>
                        <v-card>
                            <v-card-text v-html="bbcode(client.description)">
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content lazy ripple>
                        <div slot="header">Platform, Version & more</div>
                        <v-card>
                            <v-card-text>
                                Platform: <code>{{client.platform}}</code><br/>
                                <v-divider></v-divider>
                                Client Version: <code>{{client.version}}</code><br/>
                                <v-divider></v-divider>
                                IP: <code>{{client.lastIP}}</code><br/>
                                <v-divider></v-divider>
                                Country: <code>{{client.country}}</code><br/>
                                <v-divider></v-divider>
                                First connected: <code>{{client.created}}</code><br/>
                                <v-divider></v-divider>
                                Connections: <code>{{client.connections}}</code>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
	import BBCode from './xbbcode';

	export default {
		name: "client-details",
        props: ['show', 'client'],
        data() {
		    return {isOpen: this.show};
        },
        mounted() {
		    this.$watch('isOpen', () => {
                if (!this.$data.isOpen) {
                	this.close();
                }
            });
		    this.$watch('show', () => {
		    	this.$set(this.$data, 'isOpen', this.show);
            })
        },
		methods: {
			bbcode(string) {
				const r = BBCode.process({text: string ? string : ''});
				console.log(r);
				if (r.hasOwnProperty('html')) {
					return r['html'].replace(/(\r\n|\n|\r)/gm,"<br/>");
				} else {
					return string;
				}
			},
            close() {
	            this.$emit('close');
            }
		}
	}
</script>

<style scoped>
    .clientAvatar {
        object-fit: contain;
    }
</style>