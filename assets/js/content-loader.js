/* global window, document, fetch */
(function () {
	"use strict";

	var DATA_GLOBAL = "data/site-global.json";

	function byId(id) {
		return document.getElementById(id);
	}

	function escapeHtml(s) {
		if (s == null) {
			return "";
		}
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	function escapeAttr(s) {
		return escapeHtml(s).replace(/'/g, "&#39;");
	}

	function setText(el, text) {
		if (el && text != null) {
			el.textContent = text;
		}
	}

	function setFooterBackground(globalData) {
		var footer = byId("footer");
		var image = globalData && globalData.site && globalData.site.pieDePagina && globalData.site.pieDePagina.imagenFondo;
		if (!footer || !image) {
			return;
		}
		footer.style.backgroundImage =
			"linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" +
			JSON.stringify(String(image)) +
			")";
		footer.style.backgroundSize = "cover";
		footer.style.backgroundPosition = "center";
	}

	function applyPageLang(globalData, pageData) {
		var lang =
			(pageData && pageData.idiomaPagina) ||
			(globalData && globalData.site && globalData.site.idiomaHtml) ||
			"es";
		document.documentElement.lang = lang;
	}

	function applyHeaderVariant(pageData, pageName) {
		var header = byId("header");
		if (!header) {
			return;
		}
		header.classList.remove("alt");
		if (pageName === "index" && pageData && pageData.cabeceraAlt) {
			header.classList.add("alt");
		}
	}

	function renderGlobal(globalData, pageData, pageName) {
		var brand = globalData && globalData.site && globalData.site.marcaCabecera;
		var openMenu = globalData && globalData.site && globalData.site.menu && globalData.site.menu.etiquetaAbrir;
		var menu = globalData && globalData.site && globalData.site.menu;
		var useTemplateMenu = pageName === "generic" || pageName === "elements";
		var links = useTemplateMenu ? menu && menu.enlacesPlantillaHtml5Up : menu && menu.enlacesClub;

		document.querySelectorAll("#header h1 a").forEach(function (a) {
			if (brand && brand.texto) {
				a.textContent = brand.texto;
			}
			if (brand && brand.enlace) {
				a.setAttribute("href", brand.enlace);
			}
		});
		document.querySelectorAll("#header nav a[href='#menu']").forEach(function (a) {
			if (openMenu) {
				a.textContent = openMenu;
			}
		});

		document.querySelectorAll("#menu .inner h2").forEach(function (h2) {
			setText(h2, (menu && menu.titulo) || "");
		});
		document.querySelectorAll("#menu .close").forEach(function (a) {
			setText(a, (menu && menu.textoCerrar) || "");
		});
		document.querySelectorAll("#menu ul.links").forEach(function (ul) {
			if (!Array.isArray(links)) {
				return;
			}
			ul.innerHTML = links
				.map(function (link) {
					return (
						'<li><a href="' +
						escapeAttr(link.href) +
						'">' +
						escapeHtml(link.texto) +
						"</a></li>"
					);
				})
				.join("");
		});

		setFooterBackground(globalData);
		var copyright = document.querySelector("#footer ul.copyright");
		if (copyright) {
			if (pageData && pageData.pieSinCopyright) {
				copyright.innerHTML = "";
			} else {
				var prefix =
					(globalData &&
						globalData.site &&
						globalData.site.pieDePagina &&
						globalData.site.pieDePagina.prefijoUltimaActualizacion) ||
					"Última actualización:";
				var date = (globalData && globalData.ultimaActualizacion) || "";
				copyright.innerHTML = "<li>" + escapeHtml(prefix + " " + date) + "</li>";
			}
		}
	}

	function renderIndex(data) {
		document.title = data.tituloDocumento || "";
		var banner = byId("banner");
		if (banner && data.banner && data.banner.imagenFondo) {
			banner.style.backgroundImage =
				"linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(" +
				JSON.stringify(String(data.banner.imagenFondo)) +
				")";
			banner.style.backgroundSize = "auto, cover";
			banner.style.backgroundPosition = "center, center";
		}
		setText(document.querySelector("#banner h2"), (data.banner && data.banner.titulo) || "");
		setText(document.querySelector("#four .inner h2.major"), (data.seccionPrincipal && data.seccionPrincipal.titulo) || "");
		setText(document.querySelector("#four .inner > p"), (data.seccionPrincipal && data.seccionPrincipal.parrafo) || "");

		var features = document.querySelector("#four .features");
		if (features && data.seccionPrincipal && Array.isArray(data.seccionPrincipal.tarjetas)) {
			features.innerHTML = data.seccionPrincipal.tarjetas
				.map(function (card) {
					return (
						"<article>" +
						'<a href="' +
						escapeAttr(card.enlace) +
						'" class="image"><img src="' +
						escapeAttr(card.imagen) +
						'" alt="' +
						escapeAttr(card.altImagen || "") +
						'" /></a>' +
						'<h3 class="major">' +
						escapeHtml(card.titulo) +
						"</h3>" +
						"<p>" +
						escapeHtml(card.descripcion) +
						"</p>" +
						'<a href="' +
						escapeAttr(card.enlace) +
						'" class="special">' +
						escapeHtml(card.textoBoton) +
						"</a>" +
						"</article>"
					);
				})
				.join("");
		}
	}

	function renderFaq(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");

		var extraTitle = byId("faq-bloque-titulo");
		var extraP = byId("faq-bloque-parrafo");
		if (data.bloqueVacio) {
			setText(extraTitle, data.bloqueVacio.titulo || "");
			setText(extraP, data.bloqueVacio.parrafo || "");
		}

		var hero = document.querySelector(".faq-hero");
		if (hero && data.hero) {
			var h = data.hero;
			var w = h.ancho ? ' width="' + escapeAttr(String(h.ancho)) + '"' : "";
			var ht = h.alto ? ' height="' + escapeAttr(String(h.alto)) + '"' : "";
			hero.innerHTML =
				'<img src="' +
				escapeAttr(h.imagen || "") +
				'" alt="' +
				escapeAttr(h.alt || "") +
				'"' +
				w +
				ht +
				" />";
		}

		var list = document.querySelector("ol.faq-accordion");
		if (list && Array.isArray(data.preguntas)) {
			list.innerHTML = data.preguntas
				.map(function (item) {
					var parts = (item.respuesta || [])
						.map(function (block) {
							if (block.tipo === "parrafo") {
								return "<p>" + escapeHtml(block.texto) + "</p>";
							}
							if (block.tipo === "imagen") {
								var style = block.estilo ? ' style="' + escapeAttr(block.estilo) + '"' : "";
								return (
									'<img src="' +
									escapeAttr(block.src) +
									'" alt="' +
									escapeAttr(block.alt || "") +
									'"' +
									style +
									" />"
								);
							}
							if (block.tipo === "enlace") {
								var target = block.target ? ' target="' + escapeAttr(block.target) + '"' : "";
								var rel = block.rel ? ' rel="' + escapeAttr(block.rel) + '"' : "";
								return (
									"<p><a href=\"" +
									escapeAttr(block.href) +
									'"' +
									target +
									rel +
									">" +
									escapeHtml(block.texto) +
									"</a></p>"
								);
							}
							return "";
						})
						.join("");
					return (
						"<li><details><summary>" +
						escapeHtml(item.pregunta) +
						'</summary><div class="faq-answer">' +
						parts +
						"</div></details></li>"
					);
				})
				.join("");
		}
	}

	function renderCurrentBook(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");

		var current = data.libroActual || {};
		setText(document.querySelector(".reading-card--current .reading-card-title"), current.tituloSeccion || "");
		var cover = document.querySelector(".reading-card--current .cover-wrap img");
		if (cover && current.portada) {
			cover.src = current.portada.src || "";
			cover.alt = current.portada.alt || "";
			if (current.portada.ancho) {
				cover.width = current.portada.ancho;
			}
			if (current.portada.alto) {
				cover.height = current.portada.alto;
			}
		}
		setText(document.querySelector(".reading-card--current .book-title"), current.titulo || "");
		setText(document.querySelector(".reading-card--current .book-author"), current.autor || "");
		setText(document.querySelector(".reading-card--current .book-desc"), current.descripcion || "");
		setText(document.querySelector(".reading-card--current .chapters-label"), (current.capitulos && current.capitulos.etiqueta) || "");
		setText(document.querySelector(".reading-card--current .chapters-nums"), (current.capitulos && current.capitulos.numeros) || "");

		setText(
			document.querySelector(".reading-card--list[aria-labelledby='read-heading'] .reading-card-title"),
			(data.librosLeidos && data.librosLeidos.tituloSeccion) || ""
		);
		var done = document.querySelector("ol.reading-done");
		if (done) {
			done.innerHTML = ((data.librosLeidos && data.librosLeidos.elementos) || [])
				.map(function (i) {
					return "<li>" + escapeHtml(i) + "</li>";
				})
				.join("");
		}

		setText(
			document.querySelector(".reading-card--list[aria-labelledby='suggest-heading'] .reading-card-title"),
			(data.sugerencias && data.sugerencias.tituloSeccion) || ""
		);
		var suggestions = document.querySelector("ul.reading-suggestions");
		if (suggestions) {
			suggestions.innerHTML = ((data.sugerencias && data.sugerencias.titulos) || [])
				.map(function (i) {
					return "<li>" + escapeHtml(i) + "</li>";
				})
				.join("");
		}

		setText(document.querySelector("#announcement-heading"), (data.primeraReunion && data.primeraReunion.tituloSeccion) || "");
		var announcementText = document.querySelector(".announcement-text");
		if (announcementText && data.primeraReunion && data.primeraReunion.texto) {
			setText(announcementText, data.primeraReunion.texto);
		}
	}

	function renderDondeCuando(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");
		setText(document.querySelector("#social-heading"), (data.redesSociales && data.redesSociales.tituloSeccion) || "");

		var socialLinks = document.querySelector(".social-links");
		if (socialLinks && data.redesSociales && Array.isArray(data.redesSociales.enlaces)) {
			socialLinks.innerHTML = data.redesSociales.enlaces
				.map(function (link) {
					var target = link.target ? ' target="' + escapeAttr(link.target) + '"' : "";
					var rel = link.rel ? ' rel="' + escapeAttr(link.rel) + '"' : "";
					return (
						'<a class="social-btn social-btn--' +
						escapeAttr(link.clase) +
						'" href="' +
						escapeAttr(link.href) +
						'"' +
						target +
						rel +
						">" +
						escapeHtml(link.texto) +
						"</a>"
					);
				})
				.join("");
		}

		setText(document.querySelector("#reminder-heading"), (data.avisoMantitas && data.avisoMantitas.tituloSeccion) || "");
		var reminderText = document.querySelector(".reminder-text");
		if (reminderText && data.avisoMantitas && data.avisoMantitas.texto) {
			setText(reminderText, data.avisoMantitas.texto);
		}

		setText(document.querySelector("#place-heading"), (data.lugarReunion && data.lugarReunion.tituloSeccion) || "");
		var meetMeta = document.querySelector("#place-heading").closest(".where-card").querySelector(".meet-meta");
		if (meetMeta && data.lugarReunion && data.lugarReunion.fecha) {
			var label = data.lugarReunion.fecha.etiqueta || "";
			var text = data.lugarReunion.fecha.texto || "";
			meetMeta.innerHTML = "<strong>" + escapeHtml(label) + "</strong> " + escapeHtml(text);
		}
		var placeImg = document.querySelector(".place-photo img");
		if (placeImg && data.lugarReunion && data.lugarReunion.foto) {
			placeImg.src = data.lugarReunion.foto.src || "";
			placeImg.alt = data.lugarReunion.foto.alt || "";
			if (data.lugarReunion.foto.ancho) {
				placeImg.width = data.lugarReunion.foto.ancho;
			}
			if (data.lugarReunion.foto.alto) {
				placeImg.height = data.lugarReunion.foto.alto;
			}
		}
		var placeStatus = document.querySelector(".place-status");
		if (placeStatus && data.lugarReunion && data.lugarReunion.lugar) {
			var lugar = data.lugarReunion.lugar;
			if (typeof lugar === "string") {
				placeStatus.textContent = lugar;
			} else {
				var label = lugar.etiqueta || "";
				var text = lugar.texto || "";
				placeStatus.innerHTML = "<strong>" + escapeHtml(label) + "</strong> " + escapeHtml(text);
			}
		}
		setText(document.querySelector(".lunch-label"), (data.lugarReunion && data.lugarReunion.etiquetaAlmuerzo) || "");
		setText(document.querySelector(".notice-warm"), (data.lugarReunion && data.lugarReunion.aviso) || "");
	}

	function renderGatos(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");

		var grid = document.querySelector(".cats-grid");
		if (grid && Array.isArray(data.gatos)) {
			grid.innerHTML = data.gatos
				.map(function (cat) {
					var photo = cat.foto || {};
					var width = photo.ancho ? ' width="' + escapeAttr(String(photo.ancho)) + '"' : "";
					var height = photo.alto ? ' height="' + escapeAttr(String(photo.alto)) + '"' : "";
					return (
						'<article class="cat-card">' +
						'<div class="cat-photo"><img src="' +
						escapeAttr(photo.src || "") +
						'" alt="' +
						escapeAttr(photo.alt || "") +
						'"' +
						width +
						height +
						" /></div>" +
						'<p class="cat-name">' +
						escapeHtml(cat.nombre) +
						"</p>" +
						"</article>"
					);
				})
				.join("");
		}
	}

	function renderGeneric(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");

		var inner = document.querySelector("#wrapper > .wrapper > .inner");
		if (!inner) {
			return;
		}

		var html = "";
		(data.secciones || []).forEach(function (section) {
			html += '<h3 class="major">' + escapeHtml(section.titulo) + "</h3>";
			(section.parrafos || []).forEach(function (p) {
				html += "<p>" + escapeHtml(p) + "</p>";
			});
		});

		html += '<section class="features">';
		(data.caracteristicas || []).forEach(function (feature) {
			html +=
				"<article>" +
				'<a href="' +
				escapeAttr(feature.enlaceImagen) +
				'" class="image"><img src="' +
				escapeAttr(feature.imagen) +
				'" alt="' +
				escapeAttr(feature.altImagen || "") +
				'" /></a>' +
				'<h3 class="major">' +
				escapeHtml(feature.titulo) +
				"</h3>" +
				"<p>" +
				escapeHtml(feature.descripcion) +
				"</p>" +
				'<a href="' +
				escapeAttr(feature.hrefBoton) +
				'" class="special">' +
				escapeHtml(feature.textoBoton) +
				"</a>" +
				"</article>";
		});
		html += "</section>";
		inner.innerHTML = html;
	}

	function listMarkup(items, tag, className) {
		return (
			"<" +
			tag +
			(className ? ' class="' + escapeAttr(className) + '"' : "") +
			">" +
			(items || [])
				.map(function (item) {
					return "<li>" + escapeHtml(item) + "</li>";
				})
				.join("") +
			"</" +
			tag +
			">"
		);
	}

	function buildActionListGroups(grupos) {
		return (grupos || [])
			.map(function (grupo) {
				var items = (grupo.items || [])
					.map(function (it) {
						if (it.tipo === "a") {
							return (
								"<li><a href=\"" +
								escapeAttr(it.href) +
								'" class="' +
								escapeAttr(it.clase) +
								'">' +
								escapeHtml(it.texto) +
								"</a></li>"
							);
						}
						if (it.tipo === "span") {
							return (
								"<li><span class=\"" +
								escapeAttr(it.clase) +
								'">' +
								escapeHtml(it.texto) +
								"</span></li>"
							);
						}
						return "";
					})
					.join("");
				return '<ul class="' + escapeAttr(grupo.clase) + '">' + items + "</ul>";
			})
			.join("");
	}

	function buildAccionesRow(columnas) {
		return (columnas || [])
			.map(function (col) {
				var colClass = col.columna || "col-6 col-12-medium";
				return '<div class="' + escapeAttr(colClass) + '">' + buildActionListGroups(col.grupos) + "</div>";
			})
			.join("");
	}

	function buildPagination(items) {
		return (items || [])
			.map(function (it) {
				if (it.tipo === "span") {
					var cl =
						it.clase !== undefined && it.clase !== null && it.clase !== ""
							? ' class="' + escapeAttr(it.clase) + '"'
							: "";
					return "<li><span" + cl + ">" + escapeHtml(it.texto) + "</span></li>";
				}
				if (it.tipo === "a") {
					return (
						"<li><a href=\"" +
						escapeAttr(it.href) +
						'" class="' +
						escapeAttr(it.clase) +
						'">' +
						escapeHtml(it.texto) +
						"</a></li>"
					);
				}
				return "";
			})
			.join("");
	}

	function buildTableInner(columnas, filas, totalPie) {
		var head =
			"<thead><tr>" +
			(columnas || [])
				.map(function (c) {
					return "<th>" + escapeHtml(c) + "</th>";
				})
				.join("") +
			"</tr></thead>";
		var body =
			"<tbody>" +
			(filas || [])
				.map(function (row) {
					return (
						"<tr><td>" +
						escapeHtml(row[0]) +
						"</td><td>" +
						escapeHtml(row[1]) +
						"</td><td>" +
						escapeHtml(row[2]) +
						"</td></tr>"
					);
				})
				.join("") +
			"</tbody>";
		var foot =
			"<tfoot><tr><td colspan=\"2\"></td><td>" + escapeHtml(totalPie || "") + "</td></tr></tfoot>";
		return head + body + foot;
	}

	function wrapTable(tableClass, inner) {
		var c =
			tableClass !== undefined && tableClass !== null && tableClass !== ""
				? ' class="' + escapeAttr(tableClass) + '"'
				: "";
		return "<table" + c + ">" + inner + "</table>";
	}

	function buildFormulario(data) {
		var f = data.formulario || {};
		var campos = f.campos || [];
		var parts = [];

		campos.forEach(function (campo) {
			if (campo.tipo === "text" || campo.tipo === "email") {
				parts.push(
					'<div class="col-6 col-12-xsmall">' +
						'<label for="' +
						escapeAttr(campo.id) +
						'">' +
						escapeHtml(campo.etiqueta) +
						"</label>" +
						'<input type="' +
						(campo.tipo === "email" ? "email" : "text") +
						'" name="' +
						escapeAttr(campo.nombre) +
						'" id="' +
						escapeAttr(campo.id) +
						'" value="" />' +
						"</div>"
				);
			} else if (campo.tipo === "select") {
				var opts = (campo.opciones || [])
					.map(function (op) {
						return (
							'<option value="' +
							escapeAttr(op.valor) +
							'">' +
							escapeHtml(op.texto) +
							"</option>"
						);
					})
					.join("");
				parts.push(
					'<div class="col-12">' +
						'<label for="' +
						escapeAttr(campo.id) +
						'">' +
						escapeHtml(campo.etiqueta) +
						"</label>" +
						'<select name="' +
						escapeAttr(campo.nombre) +
						'" id="' +
						escapeAttr(campo.id) +
						'">' +
						opts +
						"</select>" +
						"</div>"
				);
			} else if (campo.tipo === "radio") {
				(campo.opciones || []).forEach(function (op) {
					var chk = op.marcado ? " checked" : "";
					parts.push(
						'<div class="col-4 col-12-small">' +
							'<input type="radio" id="' +
							escapeAttr(op.id) +
							'" name="' +
							escapeAttr(campo.nombre) +
							'"' +
							chk +
							">" +
							'<label for="' +
							escapeAttr(op.id) +
							'">' +
							escapeHtml(op.etiqueta) +
							"</label>" +
							"</div>"
					);
				});
			} else if (campo.tipo === "checkbox") {
				var c = campo.marcado ? " checked" : "";
				parts.push(
					'<div class="col-6 col-12-small">' +
						'<input type="checkbox" id="' +
						escapeAttr(campo.id) +
						'" name="' +
						escapeAttr(campo.nombre) +
						'"' +
						c +
						">" +
						'<label for="' +
						escapeAttr(campo.id) +
						'">' +
						escapeHtml(campo.etiqueta) +
						"</label>" +
						"</div>"
				);
			} else if (campo.tipo === "textarea") {
				parts.push(
					'<div class="col-12">' +
						'<label for="' +
						escapeAttr(campo.id) +
						'">' +
						escapeHtml(campo.etiqueta) +
						"</label>" +
						'<textarea name="' +
						escapeAttr(campo.nombre) +
						'" id="' +
						escapeAttr(campo.id) +
						'" rows="' +
						escapeAttr(String(campo.filas || 6)) +
						'"></textarea>' +
						"</div>"
				);
			}
		});

		parts.push(
			'<div class="col-12">' +
				'<ul class="actions">' +
				"<li><input type=\"submit\" value=\"" +
				escapeAttr(f.enviar || "") +
				'" class="primary" /></li>' +
				"<li><input type=\"reset\" value=\"" +
				escapeAttr(f.restablecer || "") +
				'" /></li>' +
				"</ul>" +
				"</div>"
		);

		return (
			'<form method="' +
			escapeAttr(f.metodo || "post") +
			'" action="' +
			escapeAttr(f.accion || "#") +
			'">' +
			'<div class="row gtr-uniform">' +
			parts.join("") +
			"</div></form>"
		);
	}

	function renderElements(data) {
		document.title = data.tituloDocumento || "";
		setText(document.querySelector("#wrapper > header .inner h2"), (data.encabezadoPagina && data.encabezadoPagina.titulo) || "");
		setText(document.querySelector("#wrapper > header .inner p"), (data.encabezadoPagina && data.encabezadoPagina.subtitulo) || "");

		var inner = document.querySelector("#wrapper > .wrapper > .inner");
		if (!inner) {
			return;
		}

		var L = data.listas || {};
		var ti = L.titulosInternos || {};
		var T = data.texto || {};
		var Tab = data.tabla || {};
		var B = data.botones || {};
		var Img = data.imagenes || {};

		var imageGrid = (Img.ajustarCuadricula || [])
			.map(function (img) {
				return (
					'<div class="col-' +
					(img.columnas || 4) +
					'"><span class="image fit"><img src="' +
					escapeAttr(img.src) +
					'" alt="' +
					escapeAttr(img.alt || "") +
					'" /></span></div>'
				);
			})
			.join("");

		var botonesHtml = (B.grupos || [])
			.map(function (g) {
				var items = (g.items || [])
					.map(function (it) {
						if (it.tipo === "a") {
							return (
								"<li><a href=\"" +
								escapeAttr(it.href) +
								'" class="' +
								escapeAttr(it.clase) +
								'">' +
								escapeHtml(it.texto) +
								"</a></li>"
							);
						}
						if (it.tipo === "span") {
							return (
								"<li><span class=\"" +
								escapeAttr(it.clase) +
								'">' +
								escapeHtml(it.texto) +
								"</span></li>"
							);
						}
						return "";
					})
					.join("");
				return '<ul class="' + escapeAttr(g.clase) + '">' + items + "</ul>";
			})
			.join("");

		var tableInner = buildTableInner(Tab.columnas, Tab.filas, Tab.totalPie);

		inner.innerHTML =
			"<section>" +
			'<h3 class="major">' +
			escapeHtml(T.tituloSeccion || "") +
			"</h3>" +
			(T.parrafoInlineHtml || "") +
			"<h4>" +
			escapeHtml(T.subtituloBlockquote || "") +
			"</h4>" +
			"<blockquote>" +
			escapeHtml(T.blockquote || "") +
			"</blockquote>" +
			"<h4>" +
			escapeHtml(T.subtituloPre || "") +
			"</h4>" +
			"<pre><code>" +
			escapeHtml(T.preCodigo || "") +
			"</code></pre>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' +
			escapeHtml(L.tituloSeccion || "") +
			"</h3>" +
			'<div class="row">' +
			'<div class="col-6 col-12-medium">' +
			"<h4>" +
			escapeHtml(ti.sinOrden || "") +
			"</h4>" +
			listMarkup(L.sinOrden, "ul", "") +
			"<h4>" +
			escapeHtml(ti.alternativa || "") +
			"</h4>" +
			listMarkup(L.sinOrdenAlternativa, "ul", "alt") +
			'</div><div class="col-6 col-12-medium">' +
			"<h4>" +
			escapeHtml(ti.ordenadas || "") +
			"</h4>" +
			listMarkup(L.ordenadas, "ol", "") +
			"<h4>" +
			escapeHtml(ti.iconos || "") +
			'</h4><ul class="icons">' +
			(L.iconosRedes || [])
				.map(function (icon) {
					return (
						'<li><a href="' +
						escapeAttr(icon.href) +
						'" class="icon brands fa-' +
						escapeAttr(icon.marca) +
						'"><span class="label">' +
						escapeHtml(icon.etiqueta) +
						"</span></a></li>"
					);
				})
				.join("") +
			"</ul></div></div>" +
			"<h4>" +
			escapeHtml(ti.acciones || "") +
			'</h4><div class="row">' +
			buildAccionesRow(L.accionesColumnas) +
			"</div>" +
			"<h4>" +
			escapeHtml(ti.paginacion || "") +
			'</h4><ul class="pagination">' +
			buildPagination(L.paginacionItems) +
			"</ul>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' +
			escapeHtml(Tab.tituloSeccion || "") +
			"</h3>" +
			"<h4>" +
			escapeHtml(Tab.tituloSubseccionDefault || "") +
			'</h4><div class="table-wrapper">' +
			wrapTable("", tableInner) +
			"</div>" +
			"<h4>" +
			escapeHtml(Tab.tituloSubseccionAlternativa || "") +
			'</h4><div class="table-wrapper">' +
			wrapTable("alt", tableInner) +
			"</div>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' +
			escapeHtml(B.tituloSeccion || "") +
			"</h3>" +
			botonesHtml +
			"</section>" +
			"<section>" +
			'<h3 class="major">' +
			escapeHtml((data.formulario && data.formulario.tituloSeccion) || "") +
			"</h3>" +
			buildFormulario(data) +
			"</section>" +
			"<section>" +
			'<h3 class="major">' +
			escapeHtml(Img.tituloSeccion || "") +
			"</h3>" +
			"<h4>" +
			escapeHtml(Img.ajustarTitulo || "") +
			'</h4><div class="box alt"><div class="row gtr-uniform">' +
			imageGrid +
			"</div></div>" +
			"<h4>" +
			escapeHtml(Img.izquierdaDerechaTitulo || "") +
			"</h4>" +
			'<p><span class="image left"><img src="' +
			escapeAttr((Img.parrafoImagenIzquierda && Img.parrafoImagenIzquierda.src) || "") +
			'" alt="' +
			escapeAttr((Img.parrafoImagenIzquierda && Img.parrafoImagenIzquierda.alt) || "") +
			'" /></span>' +
			escapeHtml((Img.parrafoImagenIzquierda && Img.parrafoImagenIzquierda.texto) || "") +
			"</p>" +
			'<p><span class="image right"><img src="' +
			escapeAttr((Img.parrafoImagenDerecha && Img.parrafoImagenDerecha.src) || "") +
			'" alt="' +
			escapeAttr((Img.parrafoImagenDerecha && Img.parrafoImagenDerecha.alt) || "") +
			'" /></span>' +
			escapeHtml((Img.parrafoImagenDerecha && Img.parrafoImagenDerecha.texto) || "") +
			"</p>" +
			"</section>";
	}

	function getPageName() {
		var file = window.location.pathname.split("/").pop() || "index.html";
		return file.replace(".html", "");
	}

	function getPageDataUrl(pageName) {
		return "data/" + pageName + ".json";
	}

	async function boot() {
		var pageName = getPageName();
		var globalResp = await fetch(DATA_GLOBAL);
		var pageResp = await fetch(getPageDataUrl(pageName));
		if (!globalResp.ok || !pageResp.ok) {
			console.error("content-loader: no se pudieron cargar los JSON.", DATA_GLOBAL, getPageDataUrl(pageName));
			return;
		}
		var globalData = await globalResp.json();
		var pageData = await pageResp.json();

		applyPageLang(globalData, pageData);
		applyHeaderVariant(pageData, pageName);
		renderGlobal(globalData, pageData, pageName);

		if (pageName === "index") {
			renderIndex(pageData);
		}
		if (pageName === "faq") {
			renderFaq(pageData);
		}
		if (pageName === "current_book") {
			renderCurrentBook(pageData);
		}
		if (pageName === "donde-cuando") {
			renderDondeCuando(pageData);
		}
		if (pageName === "gatos") {
			renderGatos(pageData);
		}
		if (pageName === "generic") {
			renderGeneric(pageData);
		}
		if (pageName === "elements") {
			renderElements(pageData);
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		boot().catch(function (error) {
			console.error("content-loader error:", error);
		});
	});
})();
