"use strict";
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({page}) => {
    await page.goto("http://localhost:3000/");
});

test.describe("pageChange Listeners", () => {
    test("next and prev", async ({page}) => {
        // Next
        {
            const data = await page.evaluate(() => {
                return new Promise(resolve => {
                    const fallback = setTimeout(() => {
                        resolve();
                    }, 1000);

                    const event = (data) => {
                        clearTimeout(fallback);
                        IDRViewer.off("pagechange", event);
                        resolve(data);
                    };

                    IDRViewer.on("pagechange", event);

                    IDRViewer.next();
                });
            });

            expect(data, "next: pagechange event failed to fire").not.toBeUndefined();
            expect(data.page, "next: Failed to navigate to correct page").toEqual(2);
            expect(data.pagecount, "next: Incorrect page count").toEqual(10);
            expect(data.isFirstPage, "next: Somehow ended up on the first page").toBeFalsy();
            expect(data.isLastPage, "next: Somehow ended up on the last page").toBeFalsy();
        }
        // Prev
        {
            const data = await page.evaluate(() => {
                return new Promise(resolve => {
                    const fallback = setTimeout(() => {
                        resolve();
                    }, 1000);

                    const event = (data) => {
                        clearTimeout(fallback);
                        IDRViewer.off("pagechange", event);
                        resolve(data);
                    };

                    IDRViewer.on("pagechange", event);

                    IDRViewer.prev();
                });
            });

            expect(data, "prev: pagechange event failed to fire").not.toBeUndefined();
            expect(data.page, "prev: Failed to navigate to correct page").toEqual(1);
            expect(data.pagecount, "prev: Incorrect page count").toEqual(10);
            expect(data.isFirstPage, "next: Somehow didn't end up on the first page").toBeTruthy();
            expect(data.isLastPage, "next: Somehow ended up on the last page").toBeFalsy();
        }
    });

    test("goto", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("pagechange", event);
                    resolve(data);
                };

                IDRViewer.on("pagechange", event);

                IDRViewer.goToPage(10);
            });
        });

        expect(data, "pagechange event failed to fire").not.toBeUndefined();
        expect(data.page, "Failed to navigate to correct page").toEqual(10);
        expect(data.pagecount, "Incorrect page count").toEqual(10);
        expect(data.isFirstPage, "Somehow ended end up on the first page").toBeFalsy();
        expect(data.isLastPage, "Somehow did not end up on the last page").toBeTruthy();
    });
});

test.describe("zoomchange listeners", () => {
    test("zoom in and out", async ({page}) => {
        {
            const data = await page.evaluate(() => {
                return new Promise(resolve => {
                    const fallback = setTimeout(() => {
                        resolve();
                    }, 1000);

                    const event = (data) => {
                        clearTimeout(fallback);
                        IDRViewer.off("zoomchange", event);
                        resolve(data);
                    };

                    IDRViewer.on("zoomchange", event);

                    IDRViewer.zoomIn();
                });
            });

            expect(data, "Zoom In: zoomchange event failed to fire").not.toBeUndefined();
            expect(data.zoomType, "Zoom In: Zoom is not specific").toEqual("specific");
            expect(data.scale, "Zoom In: Somehow, scale is set").toBeUndefined();
            expect(data.isMinZoom, "Zoom In: Somehow ended up on the minimum zoom").toBeFalsy();
            expect(data.isMaxZoom, "Zoom In: Somehow ended up on the maximum zoom").toBeFalsy();
        }

        {
            const data = await page.evaluate(() => {
                return new Promise(resolve => {
                    const fallback = setTimeout(() => {
                        resolve();
                    }, 1000);

                    const event = (data) => {
                        clearTimeout(fallback);
                        IDRViewer.off("zoomchange", event);
                        resolve(data);
                    };

                    IDRViewer.on("zoomchange", event);

                    IDRViewer.zoomOut();
                });
            });

            expect(data, "Zoom Out: zoomchange event failed to fire").not.toBeUndefined();
            expect(data.zoomType, "Zoom Out: Zoom is not auto").toEqual("auto");
            expect(data.scale, "Zoom Out: Somehow, scale is set").toBeUndefined();
            expect(data.isMinZoom, "Zoom Out: Somehow ended up on the minimum zoom").toBeFalsy();
            expect(data.isMaxZoom, "Zoom Out: Somehow ended up on the maximum zoom").toBeFalsy();
        }
    });

    test("set zoom 0% (stop at smallest)", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(0);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("specific");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow not the minimum zoom").toBeTruthy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom 100%", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(1);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("specific");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom IDRViewer.ZOOM_AUTO", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(IDRViewer.ZOOM_AUTO);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("auto");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom IDRViewer.ZOOM_ACTUALSIZE", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(IDRViewer.ZOOM_ACTUALSIZE);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("actualsize");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom IDRViewer.ZOOM_FITHEIGHT", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(IDRViewer.ZOOM_FITHEIGHT);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("fitheight");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom IDRViewer.ZOOM_FITWIDTH", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(IDRViewer.ZOOM_FITWIDTH);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("fitwidth");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });

    test("set zoom IDRViewer.ZOOM_FITPAGE", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("zoomchange", event);
                    resolve(data);
                };

                IDRViewer.on("zoomchange", event);

                IDRViewer.setZoom(IDRViewer.ZOOM_FITPAGE);
            });
        });

        expect(data, "zoomchange event failed to fire").not.toBeUndefined();
        expect(data.zoomType, "Zoom is not specific").toEqual("fitpage");
        expect(data.scale, "Somehow, scale is set").toBeUndefined();
        expect(data.isMinZoom, "Somehow ended up on the minimum zoom").toBeFalsy();
        expect(data.isMaxZoom, "Somehow ended up on the maximum zoom").toBeFalsy();
    });
});

test.describe("layoutchage listener", () => {
    test("set layout IDRViewer.LAYOUT_PRESENTATION", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("layoutchange", event);
                    resolve(data);
                };

                IDRViewer.on("layoutchange", event);

                IDRViewer.setLayout(IDRViewer.LAYOUT_PRESENTATION);
            });
        });

        expect(data, "layoutchange event failed to fire").not.toBeUndefined();
        expect(data.layout, "Layout is not presentation").toEqual("presentation");
    });

    test("set layout IDRViewer.LAYOUT_MAGAZINE", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("layoutchange", event);
                    resolve(data);
                };

                IDRViewer.on("layoutchange", event);

                IDRViewer.setLayout(IDRViewer.LAYOUT_MAGAZINE);
            });
        });

        expect(data, "layoutchange event failed to fire").not.toBeUndefined();
        expect(data.layout, "Layout is not magazine").toEqual("magazine");
    });

    test("set layout IDRViewer.LAYOUT_CONTINUOUS", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("layoutchange", event);
                    resolve(data);
                };

                IDRViewer.on("layoutchange", event);

                IDRViewer.setLayout(IDRViewer.LAYOUT_CONTINUOUS);
            });
        });

        expect(data, "layoutchange event failed to fire").not.toBeUndefined();
        expect(data.layout, "Layout is not continuous").toEqual("continuous");
    });
});

test.describe("selectchange listener", () => {
    test("set select mod IDRViewer.SELECT_PAN", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("selectchange", event);
                    resolve(data);
                };

                IDRViewer.on("selectchange", event);

                IDRViewer.setSelectMode(IDRViewer.SELECT_PAN);
            });
        });

        expect(data, "selectchange event failed to fire").not.toBeUndefined();
        expect(data.type, "Select mode is not pan").toEqual("pan");
    });

    test("set select mod IDRViewer.SELECT_SELECT", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("selectchange", event);
                    resolve(data);
                };

                IDRViewer.on("selectchange", event);

                IDRViewer.setSelectMode(IDRViewer.SELECT_SELECT);
            });
        });

        expect(data, "selectchange event failed to fire").not.toBeUndefined();
        expect(data.type, "Select mode is not select").toEqual("select");
    });
});

test.describe("rotationchange listener", () => {
    test("rotate clockwise (90 degrees)", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("rotationchange", event);
                    resolve(data);
                };

                IDRViewer.on("rotationchange", event);

                IDRViewer.rotate(90);
            });
        });

        expect(data, "rotate: rotationchange event failed to fire").not.toBeUndefined();
        expect(data.rotation, "rotate: Failed to rotate to correct angle").toEqual(90);
    });

    test("rotate counter-clockwise normalises negative angles", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("rotationchange", event);
                    resolve(data);
                };

                IDRViewer.setRotation(0);
                IDRViewer.on("rotationchange", event);

                IDRViewer.rotate(-90);
            });
        });

        expect(data, "rotate: rotationchange event failed to fire").not.toBeUndefined();
        expect(data.rotation, "rotate: Negative rotation not normalised to 0-360").toEqual(270);
    });

    test("setRotation to specific angle", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("rotationchange", event);
                    resolve(data);
                };

                IDRViewer.on("rotationchange", event);

                IDRViewer.setRotation(180);
            });
        });

        expect(data, "setRotation: rotationchange event failed to fire").not.toBeUndefined();
        expect(data.rotation, "setRotation: Failed to set correct angle").toEqual(180);
    });

    test("setRotation normalises angles greater than 360", async ({page}) => {
        const data = await page.evaluate(() => {
            return new Promise(resolve => {
                const fallback = setTimeout(() => {
                    resolve();
                }, 1000);

                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("rotationchange", event);
                    resolve(data);
                };

                IDRViewer.on("rotationchange", event);

                IDRViewer.setRotation(450);
            });
        });

        expect(data, "setRotation: rotationchange event failed to fire").not.toBeUndefined();
        expect(data.rotation, "setRotation: Angle not normalised to 0-360").toEqual(90);
    });
});

test.describe("rotation input validation", () => {
    const invalidValues = [
        { value: 45, label: "non-multiples of 90" },
        { value: "90", label: "strings" },
        { value: NaN, label: "NaN" },
        { value: Infinity, label: "Infinity" },
        { value: undefined, label: "undefined" },
        { value: null, label: "null" },
        { value: false, label: "false" }
    ];

    for (const { value, label } of invalidValues) {
        test(`setRotation rejects ${label}`, async ({page}) => {
            const result = await page.evaluate((v) => {
                try {
                    IDRViewer.setRotation(v);
                    return { threw: false };
                } catch (e) {
                    return { threw: true, name: e.name };
                }
            }, value);
            expect(result.threw, "setRotation should throw").toBe(true);
            expect(result.name, "setRotation should throw TypeError").toEqual("TypeError");
        });

        test(`rotate rejects ${label}`, async ({page}) => {
            const result = await page.evaluate((v) => {
                try {
                    IDRViewer.rotate(v);
                    return { threw: false };
                } catch (e) {
                    return { threw: true, name: e.name };
                }
            }, value);
            expect(result.threw, "rotate should throw").toBe(true);
            expect(result.name, "rotate should throw TypeError").toEqual("TypeError");
        });
    }

    test("rotation state is unchanged after a rejected call", async ({page}) => {
        const result = await page.evaluate(() => {
            IDRViewer.setRotation(0);
            let captured;
            const listener = (data) => { captured = data.rotation; };
            IDRViewer.on("rotationchange", listener);

            let threw = false;
            try {
                IDRViewer.rotate(45);
            } catch (e) {
                threw = true;
            }

            IDRViewer.off("rotationchange", listener);

            // A subsequent valid call should land on 90, not 135.
            return new Promise(resolve => {
                const fallback = setTimeout(() => resolve({ threw, captured, finalRotation: undefined }), 1000);
                const event = (data) => {
                    clearTimeout(fallback);
                    IDRViewer.off("rotationchange", event);
                    resolve({ threw, captured, finalRotation: data.rotation });
                };
                IDRViewer.on("rotationchange", event);
                IDRViewer.rotate(90);
            });
        });

        expect(result.threw, "rotate(45) should throw").toBe(true);
        expect(result.captured, "Failed call should not fire rotationchange").toBeUndefined();
        expect(result.finalRotation, "Subsequent rotate(90) should land on 90, proving state was untouched").toEqual(90);
    });
});