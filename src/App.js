import { useState, useRef, useEffect } from "react";
/**
 * ------------------------------------------------------------
 * all svg that are download from Google Icon and FontAwesome
 * * Source: https://fonts.google.com/icons
 * * Source: https://fontawesome.com/icons/
 * ------------------------------------------------------------
 */
import { ReactComponent as CopySvg } from "./svg/copy.svg";
import { ReactComponent as EyeDropperSvg } from "./svg/eyeDropper.svg";
import { ReactComponent as TrashSvg } from "./svg/trash.svg";
import { ReactComponent as SettingSvg } from "./svg/settings.svg";
import { ReactComponent as DoneSvg } from "./svg/done.svg";
import { ReactComponent as CloseSvg } from "./svg/close.svg";
import { ReactComponent as HelpSvg } from "./svg/help.svg";
import { ReactComponent as ClearSvg } from "./svg/clear.svg";
import { ReactComponent as GitHubSvg } from "./svg/github.svg";
import { ReactComponent as InfoSvg } from "./svg/info.svg";
/**
 * ------------------------------------------------------------
 * @tauri-apps/api Client side API provided by Tauri for ipc
 * and other stuff
 * * Source https://tauri.studio/docs/api/js/
 * ------------------------------------------------------------
 */
import { appWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/api/shell";

import {
    hexToRgb,
    hexToHSL,
    hslToHex,
    checkTextColor,
} from "./utils/colorUtil";

function App() {
    // usedColor helps to store all color that selected previous
    const [usedColor, setUsedColor] = useState([]);
    // current selected color space
    const [selectedColor, setSelectedColor] = useState({
        index: 0, // index is the usedColor position
        hex: "", // converted hex value
        rgb: "", // converted rgb value
        hsl: "", // converted hsl value
    });
    // this is for delete context menu
    const [contextMenuOpen, setContextMenuOpen] = useState({
        open: false, // check open or not
        X: 0, // click mouse X position
        Y: 0, // click mouse Y position
    });
    // displaying the clipboard copy notification
    const [copyMessage, setCopyMessage] = useState(false);

    /**
     * Main color picker function helps to open EyeDropper tool and pick the color
     * To know more visit the EyeDropper API page
     * * Source: https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API
     */
    const handleColorPick = () => {
        // checking for the API exist on the window
        if (!window.EyeDropper) {
            console.log("Your browser does not support the EyeDropper API");
            return;
        }
        const eyeDropper = new window.EyeDropper();
        eyeDropper
            .open()
            .then(async (result) => {
                // result return the sRGBHex value i.e a hex value of the color eg-#555555
                // setting the selected color and set index of first
                setSelectedColor({
                    index: 0,
                    hex: result.sRGBHex,
                    rgb: hexToRgb(result.sRGBHex),
                    hsl: hexToHSL(result.sRGBHex)[0],
                });
                // add the picked color to the first of the list
                setUsedColor((state) => [result.sRGBHex, ...state]);
                // store the color list in the localStorage
                // for more information about localStorage visit
                // * Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
                // here we use the key as "colors"
                window.localStorage.setItem(
                    "colors", // key
                    JSON.stringify([result.sRGBHex, ...usedColor]) // value
                );
            })
            .catch((e) => {
                console.log(e);
            });
    };
    /**
     * helps to select and display information about the color in the right
     * @param {number} index index of the usedColor array
     */
    const handleColorSelect = (index) => {
        // if the delete context meu open the we close first
        handleContextMenuClose();
        // setting the color
        setSelectedColor({
            index,
            hex: usedColor[index],
            rgb: hexToRgb(usedColor[index]),
            hsl: hexToHSL(usedColor[index])[0],
        });
    };

    /**
     *  handle color delete content menu when we right click any of the color
     * @param {event} e
     * @param {number} index index of the usedColor array
     */
    const handleContextMenuOpen = (e, index) => {
        // preventing default to open default right click context menu
        e.preventDefault();
        // getting the mouse position for summon the context menu in ths position
        let { pageX, pageY } = e;
        // if the menu is already open the setting close otherwise open
        setContextMenuOpen({
            open: !contextMenuOpen.open,
            X: pageX,
            Y: pageY,
            index: index,
        });
    };
    // helps to close the context menu
    const handleContextMenuClose = () => {
        setContextMenuOpen({
            open: false,
            X: 0,
            Y: 0,
        });
    };
    /**
     * helps to delete the color if the content menu delete button pressed
     * @param {number} index index of the usedColor array
     */
    const handleColorDelete = (index) => {
        // checking for that the selected color index is the equal to which color going to delete
        // if so we have to change the current selected color because the selected color will be delete
        if (index === selectedColor.index)
            setSelectedColor({
                index: 0,
                hex: usedColor[0],
                rgb: hexToRgb(usedColor[0]),
                hsl: hexToHSL(usedColor[0])[0],
            });
        // filtering the color
        setUsedColor((state) => state.filter((item, i) => i !== index));
    };
    /**
     * helps to copy the color and write it into the clipboard using clipboard API
     * * Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
     * @param {string} str color value either hex, hsl or rgb
     */
    const handleCopyToClipboard = (str) => {
        // check the clipboard api is present or not
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setCopyMessage(true);
            return navigator.clipboard.writeText(str);
        }
        return Promise.reject("The Clipboard API is not available.");
    };
    useEffect(() => {
        // disabling the right click only for build not in browser
        document.addEventListener("contextmenu", (event) =>
            event.preventDefault()
        );
        // get the color list in the localStorage
        // for more information about localStorage visit
        // * Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
        // here we use the key as "colors" so we fetch the color
        let colors = window.localStorage.getItem("colors");
        // check that the colors is not null i.e colors is present in the storage or not
        if (colors !== null) {
            colors = JSON.parse(colors);
            // setting the selected color to first color of the list
            setSelectedColor({
                index: 0, // current/ top index
                hex: colors[0], // hex color return from EyeDropper tool
                rgb: hexToRgb(colors[0]), // converting the color to RGB
                hsl: hexToHSL(colors[0])[0], // converting the color to HSL
            });
            // setting the new color to the color list
            setUsedColor([...colors]);
        }
    }, []);

    return (
        <>
            {/**
             * context menu when user right click any of the color
             * show the menu having one item delete
             */}
            {contextMenuOpen.open && (
                <ContextMenu
                    handleDelete={() =>
                        handleColorDelete(contextMenuOpen.index)
                    }
                    handleContextMenuClose={handleContextMenuClose}
                    style={{
                        top: `${contextMenuOpen.Y}px`,
                        left: `${contextMenuOpen.X}px`,
                    }}
                />
            )}
            {/* Clipboard copy message */}
            {copyMessage && <CopyMessage setCopyMessage={setCopyMessage} />}
            {/* left side vertical bar where the EyeDropper tool, and the picked color displayed */}
            <div className="left-wrapper">
                {/* EyeDropper button */}
                <div className="eye-dropper-wrapper">
                    <button onClick={handleColorPick}>
                        <EyeDropperSvg />
                    </button>
                </div>
                {/* Previously picked color list  */}
                <div className="color-palette">
                    {usedColor.map((item, index) => (
                        <div
                            className={`color-wrapper ${
                                index === selectedColor.index && "active"
                            }`}
                            key={index}
                            // selecting the color
                            onClick={() => handleColorSelect(index)}
                            // open the context menu
                            onContextMenu={(e) =>
                                handleContextMenuOpen(e, index)
                            }
                        >
                            <div
                                className="color"
                                style={{ backgroundColor: item }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
            {/**right side where all the content having the color pallette and the all the color space of the selected color
             * titleBar
             */}
            <div className="right-wrapper">
                {/* title bar  */}
                <TitleBar setUsedColor={setUsedColor} />
                <div className="component-outer-wrapper">
                    {/* if there is no color the display the message */}
                    {usedColor.length === 0 ? (
                        <div className="no-color">
                            <EyeDropperSvg />
                            <p>
                                Press the Color Picker icon to capture a color
                                from your screen.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* generated color pallette of eight colors */}
                            <ColorsPalette
                                color={selectedColor.hex}
                                setCopyMessage={setCopyMessage}
                            />
                            {/* all three color space */}
                            <div className="color-code-wrapper">
                                <ColorCode
                                    type="HEX"
                                    colorCode={selectedColor.hex}
                                    copy={handleCopyToClipboard}
                                />
                                <ColorCode
                                    type="RGB"
                                    colorCode={selectedColor.rgb}
                                    copy={handleCopyToClipboard}
                                />
                                <ColorCode
                                    type="HSL"
                                    colorCode={selectedColor.hsl}
                                    copy={handleCopyToClipboard}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;

/**
 * TitleBar of the window
 * @param {setState} setUsedColor set color helps to clear the all previously picked colors
 * @returns JSX
 */
const TitleBar = ({ setUsedColor }) => {
    // all menu open setStare
    const [menu, setMenu] = useState({
        active: false, // check open or not
        type: null, // which menu is open setting or help
        items: null, // all items and its icon , name and the action
        X: 0, // click mouse X position
        Y: 0, // click mouse Y position
    });
    /**
     * helps to open the the menu item
     * @param {event} e
     * @param {string} target Selected menu item
     */
    const openMenu = (e, target) => {
        // getting the all offset value
        let { offsetHeight, offsetLeft, offsetTop, offsetWidth } =
            e.currentTarget;
        let active = true;
        let items = []; // for storing the selected list item
        // check that menu is active and the current menu is the target menu the close
        if (menu.active && menu.type === target) active = false;
        // selecting the list according to the selection
        switch (target) {
            case "setting":
                items = [
                    {
                        name: "Clear List",
                        icon: <ClearSvg />,
                        action: () => setUsedColor([]),
                    },
                ];
                break;
            case "help":
                items = [
                    {
                        name: "Help Online",
                        icon: <GitHubSvg />,
                        action: async () =>
                            await open(
                                "https://github.com/50UM3N/color-picker"
                            ),
                    },
                    {
                        name: "About",
                        icon: <InfoSvg />,
                        action: async () =>
                            await open(
                                "https://github.com/50UM3N/color-picker"
                            ),
                    },
                ];
                break;
            default:
                return;
        }
        setMenu({
            active,
            X: offsetTop + offsetHeight,
            Y: offsetLeft + offsetWidth,
            type: target,
            items,
        });
    };
    return (
        <div className="header">
            {/**
             * mover that helps to move the window
             * * Source: https://tauri.studio/docs/getting-started/prerequisites
             * data-tauri-drag-region helps to apply the drag region
             */}
            <div className="mover" data-tauri-drag-region>
                <div></div>
            </div>
            <div className="windows-manager-wrapper">
                <button
                    className="setting-btn"
                    onClick={(e) => openMenu(e, "help")}
                >
                    <HelpSvg />
                </button>
                <button
                    className="setting-btn"
                    onClick={(e) => openMenu(e, "setting")}
                >
                    <SettingSvg />
                </button>
                <button className="close-btn" onClick={() => appWindow.close()}>
                    <CloseSvg />
                </button>
            </div>
            {/* opening the menu */}
            {menu.active && (
                <Menu
                    setMenu={setMenu}
                    items={menu.items}
                    style={{
                        top: `${menu.X}px`,
                        left: `${menu.Y}px`,
                        transform: "translateX(-100%)",
                    }}
                />
            )}
        </div>
    );
};

/**
 * Actual menu items when user click info or the setting button at the title bar
 * @param {array} items array of objects {name: name of the item, icon: jsx element,action: onclick action}
 * @param {style object} style jsx style object
 * @returns
 */
const Menu = ({ items, style }) => {
    const ref = useRef(null);
    useEffect(() => {
        // for smoother animation adding the class active
        ref.current.classList.add("active");
    }, []);
    return (
        <ul ref={ref} className="menu" style={style}>
            {items.map((item, idx) => (
                <li key={idx} onClick={item.action}>
                    {item.icon}
                    <span>{item.name}</span>
                </li>
            ))}
        </ul>
    );
};

/**
 * Clipboard copy message component
 * @param {setState} setCopyMessage for displaying/removing the clipboard copy message
 * @returns JSX
 */
const CopyMessage = ({ setCopyMessage }) => {
    // for manipulating the class of the wrapper
    const ref = useRef(null);
    useEffect(() => {
        // for animation bottom to top
        ref.current.classList.add("active");
        // after 2second remove the class from active to go down top to bottom
        const timeout = setTimeout(() => {
            ref.current.classList.remove("active");
            // after removing the class and performing the animation unmount the component
            setTimeout(() => {
                setCopyMessage(false);
            }, 100);
        }, 2000);

        return () => {
            clearTimeout(timeout);
        };
    }, [setCopyMessage]);

    return (
        <div className="copy-message" ref={ref}>
            <CopySvg />
            <p>Copied to clipboard</p>
        </div>
    );
};

/**
 * Right click context menu display when right click the picked color
 * @param {style object} style jsx style object
 * @param {function} handleDelete helps to delete the color
 * @param {function} handleContextMenuClose close the context menu
 * @returns
 */
const ContextMenu = ({ style, handleDelete, handleContextMenuClose }) => {
    // for manipulating the class of the wrapper
    const ref = useRef(null);
    useEffect(() => {
        // adding a onclick event listener when the delete context menu open if left click eny of the point
        // then the context menu will close
        document.onclick = handleContextMenuClose;
        // for animation
        ref.current.classList.add("active");
        return () => {
            // removing the on click listener when component is unmount for unwanted memory leak
            document.onclick = null;
        };
    }, [handleContextMenuClose]);

    return (
        <ul ref={ref} className="context-menu" style={style}>
            <li onClick={handleDelete}>
                <TrashSvg />
                <span>Remove</span>
            </li>
        </ul>
    );
};

/**
 * Color code horizontal rectangular box
 * @param {string} type  type of the color
 * @param {string} colorCode that type color code
 * @param {function} copy copy function that helps to copy on the clipboard
 * @returns
 */
const ColorCode = ({ type, colorCode, copy }) => {
    return (
        <div className="color-code-palette">
            <p className="color-code-type">{type}</p>
            <p className="color-code">{colorCode}</p>
            <button className="copy-btn" onClick={() => copy(colorCode)}>
                <CopySvg />
            </button>
        </div>
    );
};

/**
 * Display 8 intensity value of the selected color
 * @param {*} color hex color of the selected color
 * @param {setState} setCopyMessage displaying the clipboard copy message
 * @returns JSX
 */
const ColorsPalette = ({ color, setCopyMessage }) => {
    // storing the 8 colors hex value
    const [colorPalette, setColorPalette] = useState([]);
    // for referencing the all 8 color div for manipulating class
    const colorRef = useRef([]);
    /**
     * helps to copy the color and write it into the clipboard using clipboard API
     * * Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
     * @param {number} index position of the color in the colorPalette
     * @param {string} str color value either hex, hsl or rgb
     */
    const handleColorCopy = (index, str) => {
        // apply a class when click the any of the color to display the tik mark
        colorRef.current[index].classList.add("is-copied");
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setCopyMessage(true);
            return navigator.clipboard.writeText(str);
        }
        return Promise.reject("The Clipboard API is not available.");
    };
    /**
     * When mouse out from the clicked color remove the tik mark
     * @param {*} index position of the color in the colorPalette
     */
    const mouseHoverOut = (index) => {
        colorRef.current[index].classList.remove("is-copied");
    };
    useEffect(() => {
        // generating the all eight color intensity value using luminous manipulation
        let arr = [];
        // getting the only h and s value of the selected hex color by converting
        let [h, s] = hexToHSL(color)[1];
        // stride value
        let counter = 11;
        for (let i = 0; i < 8; i++) {
            arr.push(hslToHex(h, s, counter));
            counter += 11;
        }
        // setting the generated color array
        setColorPalette(arr);
    }, [color]); // you have to add the color as a dependency or it can not rerender the useEffect when the selected color change
    return (
        <div className="color-palette">
            {colorPalette.map((item, index) => (
                <div
                    key={index}
                    className={`color ${
                        checkTextColor(item) ? "isDark" : "isLite" // if the color intensity value is height the show the text light otherwise dark
                    }`}
                    style={{ backgroundColor: item }} // setting the background color
                    ref={(el) => (colorRef.current[index] = el)} // referencing into array
                    onClick={() => handleColorCopy(index, item)}
                    onMouseOut={() => mouseHoverOut(index)} // mouse out from the selected color
                >
                    <DoneSvg />
                    <p>{item.split("#")[1]}</p>
                </div>
            ))}
        </div>
    );
};
