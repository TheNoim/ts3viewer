<template>
    <v-app v-bind:dark="this.$root.$data.darkMode">
        <v-layout column>
            <div>
                <v-toolbar dense fixed>
                    <v-toolbar-title v-html="title"></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-switch v-model="darkMode" label="Dark Mode" hide-details
                              class="darkModeSwitch"></v-switch>
                    <v-btn @click="rev()">Reverse</v-btn>
                </v-toolbar>
            </div>
            <div class="main">
                <v-container id="searchBarContainer">
                    <v-layout id="searchBarTitle" row justify-center align-center>
                        <h1>Search User</h1>
                    </v-layout>
                    <v-layout row justify-center align-center>
                        <v-flex xs12 sm6>
                            <div class="wrapper">
                                <v-text-field v-model="searchString" :dark="this.$root.$data.darkMode" solo label="Search">
                                </v-text-field>
                                <v-progress-circular v-if="loading" class="searchProgress" indeterminate></v-progress-circular>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-container>
            </div>
            <v-footer fixed>
                <div>Teamspeak 3 Viewer {{version}} by TheNoim</div>
                <v-spacer></v-spacer>
                <div v-html="customFooterText"></div>
            </v-footer>
        </v-layout>
    </v-app>
</template>

<script>
	import anime from 'animejs';

	let animation;
	let animation2;
	let waiting = false;

	export default {
		name: "search",
		data() {
			return {
				loading: false,
				channelTree: [],
				darkMode: this.$root.$data.darkMode,
				title: this.$root.$data.title,
				version: this.$root.$data.version,
				customFooterText: this.$root.$data.customFooterText,
                searchString: "",
			};
		},
		mounted() {
			this.darkModeEvent();
			// animation = anime({
			// 	targets: '#searchBarContainer',
			// 	duration: 500,
			// 	top: ['40vh', '5vh'],
			// 	elasticity: 0
			// });
            this.events();
		},
		methods: {
			darkModeEvent() {
				this.$watch('darkMode', () => {
					this.$root.$set(this.$root.$data, 'darkMode', this.$data.darkMode);
				});
			},
            events() {
			    this.$watch('searchString', () => {
			    	if (this.$data.searchString !== "" && !animation) {
					    animation = anime({
					    	targets: '#searchBarContainer',
					    	duration: 1000,
					    	top: ['40vh', '5vh'],
					    	elasticity: 0
					    });
					    animation2 = anime({
						    targets: '#searchBarTitle',
						    duration: 1000,
                            height: ['42px', '0px'],
                            opacity: ['1', '0'],
						    elasticity: 0
					    });
					    console.log(JSON.stringify(animation));
                    } else if (this.$data.searchString !== "" && animation.reversed && animation.completed) {
					    animation.reverse();
					    animation.play();
					    animation2.reverse();
					    animation2.play();
                    } else if (this.$data.searchString !== "" && animation.reversed && !animation.completed) {
			    		if (!waiting) {
			    			waiting = true;
			    			animation.finished.then(() => {
							    animation.reverse();
							    animation.play();
							    animation2.reverse();
							    animation2.play();
							    waiting = false;
                            });
                        }
                    } else if (this.$data.searchString === "" && !animation.reversed && animation.completed) {
					    animation.reverse();
					    animation.play();
					    animation2.reverse();
					    animation2.play();
                    } else if (this.$data.searchString === "" && !animation.reversed && !animation.completed) {
					    if (!waiting) {
						    waiting = true;
						    animation.finished.then(() => {
							    animation.reverse();
							    animation.play();
							    animation2.reverse();
							    animation2.play();
							    waiting = false;
						    });
					    }
                    }
                });
            },
            rev() {
                // console.log("1", animation)
                // if (animation) {
	             //    animation.reverse();
	             //    animation.play();
	             //    console.log("2", animation);
	             //    animation.finished.then(() => {
		         //        console.log("3", animation);
                //     });
                // }
            }
		}
	}
</script>

<style scoped>
    .darkModeSwitch {
        max-width: 125px;
    }

    .main {
        padding-top: 48px;
        padding-bottom: 36px;
    }

    .minHeight {
        min-height: 80vh;
    }

    .pS {
        position: absolute;
    }

    .wrapper {
        position: relative;
    }

    .searchProgress {
        position: absolute;
        top: 15%;
        right: 2%;
    }

    #searchBarContainer {
        position: fixed;
        top: 40vh;
        width: 100%;
        right: 0;
        left: 0;
    }
</style>